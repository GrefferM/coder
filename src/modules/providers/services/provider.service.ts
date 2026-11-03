import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  KNOWN_PROVIDERS,
  PROVIDERS_FILE_NAME,
  PROVIDERS_OFF_FILE_NAME,
  PROVIDER_ASK_TIMEOUT_MS,
  PROVIDER_HAS_NO_ADDRESS,
  PROVIDER_MODEL_PATHS,
  PROVIDER_SECRET_PREFIX,
  UNKNOWN_PROVIDER,
} from "../constants";
import type {
  KnownProvider,
  ProviderKeyStore,
  ProviderInstalledModel,
  ProviderReply,
  ProviderState,
} from "../interfaces";
import type { AskProviderDto, SaveProviderAddressDto, SaveProviderKeyDto, SwitchProviderDto } from "../dto";
import { Refusal } from "../../../utils/refusals";

/**
 * The known providers and what this machine holds for each: keys encrypted, addresses in the clear, and which of them
 * stand off.
 */
export class ProviderService {
  constructor(
    private readonly keys: ProviderKeyStore,
    private readonly userDataDirectory: string,
  ) {}

  async list(): Promise<ProviderState[]> {
    const hints = await this.keys.hints();
    const addresses = await this.readAddresses();
    const off = await this.readOff();
    const hintOf = new Map(hints.map((held) => [held.key, held.hint]));

    return KNOWN_PROVIDERS.map((provider) => ({
      ...provider,
      keyHint: hintOf.get(this.secretKey(provider.id)) ?? null,
      address: addresses[provider.id] ?? null,
      isOff: off.includes(provider.id),
    }));
  }

  /** A provider's plain-text key; main-process callers only, never sent to a screen. */
  async keyOf(providerId: string): Promise<string | null> {
    return this.keys.value(this.secretKey(this.known(providerId).id));
  }

  /** The saved or customary address of a provider that asks for one; `null` otherwise. */
  async addressOf(providerId: string): Promise<string | null> {
    const provider = this.known(providerId);

    if (!provider.needs.includes("address")) {
      return null;
    }

    const addresses = await this.readAddresses();

    return addresses[provider.id] ?? provider.customaryAddress;
  }

  /** What a local provider has installed; one not running reports `isAnswering: false`. */
  async ask(payload: AskProviderDto): Promise<ProviderReply> {
    // Only local providers are asked; a remote one is not polled.
    if (this.known(payload.providerId).kind !== "local") {
      throw new Refusal(UNKNOWN_PROVIDER);
    }

    const address = await this.addressOf(payload.providerId);

    if (address === null) {
      throw new Refusal(PROVIDER_HAS_NO_ADDRESS);
    }

    try {
      const answer = await fetch(`${address}${PROVIDER_MODEL_PATHS[payload.providerId]}`, {
        signal: AbortSignal.timeout(PROVIDER_ASK_TIMEOUT_MS),
      });

      return {
        isAnswering: answer.ok,
        models: answer.ok ? this.installed(await answer.json()) : [],
      };
    } catch {
      return {
        isAnswering: false,
        models: [],
      };
    }
  }

  /** Whether a local provider is running; a remote one always reads as answering. */
  async isAnswering(providerId: string): Promise<boolean> {
    if (this.known(providerId).kind !== "local") {
      return true;
    }

    const reply = await this.ask({
      providerId,
    });

    return reply.isAnswering;
  }

  /** Writes the key of a provider that asks for one; an empty value removes it. */
  async saveKey(payload: SaveProviderKeyDto): Promise<void> {
    const provider = this.known(payload.providerId);
    const value = payload.value.trim();

    if (!provider.needs.includes("key")) {
      throw new Refusal(UNKNOWN_PROVIDER);
    }

    if (value === "") {
      await this.keys.remove({
        key: this.secretKey(provider.id),
      });

      return;
    }

    await this.keys.set({
      key: this.secretKey(provider.id),
      value,
    });
  }

  /** Writes the address of a provider that asks for one; empty falls back to the customary one. */
  async saveAddress(payload: SaveProviderAddressDto): Promise<void> {
    const provider = this.known(payload.providerId);
    const value = payload.value.trim();

    if (!provider.needs.includes("address")) {
      throw new Refusal(UNKNOWN_PROVIDER);
    }

    const held = await this.readAddresses();

    if (value === "") {
      delete held[provider.id];
    } else {
      held[provider.id] = value;
    }

    await this.writeAddresses(held);
  }

  /** Turns a provider off on this machine, or back on; its key and address are not touched. */
  async switchOff(payload: SwitchProviderDto): Promise<void> {
    const provider = this.known(payload.providerId);
    const others = (await this.readOff()).filter((providerId) => providerId !== provider.id);

    await this.writeHeld(PROVIDERS_OFF_FILE_NAME, payload.isOff ? [...others, provider.id] : others);
  }

  private known(providerId: string): KnownProvider {
    const provider = KNOWN_PROVIDERS.find((known) => known.id === providerId);

    if (provider === undefined) {
      throw new Refusal(UNKNOWN_PROVIDER);
    }

    return provider;
  }

  /** Installed models from the reply: Ollama under `models` with a byte size, LM Studio under `data` without. */
  private installed(answer: unknown): ProviderInstalledModel[] {
    const said = <{ models?: unknown; data?: unknown }>answer;
    const list = Array.isArray(said.models) ? said.models : Array.isArray(said.data) ? said.data : [];

    return list.map((item: { name?: unknown; id?: unknown; size?: unknown }) => ({
      name: String(item.name ?? item.id),
      sizeBytes: typeof item.size === "number" ? item.size : null,
    }));
  }

  private secretKey(providerId: string): string {
    return `${PROVIDER_SECRET_PREFIX}${providerId}`;
  }

  /** The saved addresses by provider id; none where the file is missing, unreadable or not of that shape. */
  private async readAddresses(): Promise<Record<string, string>> {
    const held = await this.readHeld(PROVIDERS_FILE_NAME);

    return this.isAddresses(held) ? held : {};
  }

  private async writeAddresses(held: Record<string, string>): Promise<void> {
    await this.writeHeld(PROVIDERS_FILE_NAME, held);
  }

  /** The ids of the providers standing off; none where the file is missing, unreadable or not a list of ids. */
  private async readOff(): Promise<string[]> {
    const held = await this.readHeld(PROVIDERS_OFF_FILE_NAME);

    return this.isIds(held) ? held : [];
  }

  /** One of this machine's files as parsed, or `null` where it is missing or not JSON. */
  private async readHeld(fileName: string): Promise<unknown> {
    try {
      return JSON.parse(await readFile(this.filePath(fileName), "utf8"));
    } catch {
      return null;
    }
  }

  private isAddresses(held: unknown): held is Record<string, string> {
    return (
      typeof held === "object" &&
      held !== null &&
      !Array.isArray(held) &&
      Object.values(held).every((value) => typeof value === "string")
    );
  }

  private isIds(held: unknown): held is string[] {
    return Array.isArray(held) && held.every((value) => typeof value === "string");
  }

  /** Writes one of this machine's files whole, through a temporary one beside it. */
  private async writeHeld(fileName: string, held: unknown): Promise<void> {
    const filePath = this.filePath(fileName);
    const temporaryPath = `${filePath}.tmp`;

    await mkdir(path.dirname(filePath), {
      recursive: true,
    });
    await writeFile(temporaryPath, JSON.stringify(held, null, 2), "utf8");
    await rename(temporaryPath, filePath);
  }

  private filePath(fileName: string): string {
    return path.join(this.userDataDirectory, fileName);
  }
}
