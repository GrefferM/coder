import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { HEARING_FILE_NAME, HEARING_FILE_NAMES, HEARING_PATH, HEARING_WAYS, SPEECH_FILE_NAME } from "../constants";
import { SPEECH_HEARING_FAILED, SPEECH_NOT_SET } from "../interfaces";
import { Refusal } from "../../../utils/refusals";
import { atProtocol } from "../../../utils/addresses";
import type { HearingCall, HeardSound, SpeechReach, SpeechSettings } from "../interfaces";

/** What this machine speaks with, kept in the clear beside the database, and recognition itself. */
export class SpeechService {
  constructor(
    private readonly reach: SpeechReach,
    private readonly userDataDirectory: string,
  ) {}

  /** The settings as written; a field missing, or a file missing or not of its shape, reads as `null`. */
  async settings(): Promise<SpeechSettings> {
    const held = await this.readHeld();

    return {
      voiceName: this.textOf(held, "voiceName"),
    };
  }

  /** Writes the settings whole, through a temporary file beside them. */
  async save(settings: SpeechSettings): Promise<void> {
    const filePath = path.join(this.userDataDirectory, SPEECH_FILE_NAME);
    const temporaryPath = `${filePath}.tmp`;
    const written: SpeechSettings = {
      voiceName: settings.voiceName,
    };

    await mkdir(path.dirname(filePath), {
      recursive: true,
    });
    await writeFile(temporaryPath, JSON.stringify(written, null, 2), "utf8");
    await rename(temporaryPath, filePath);
  }

  /** The words the provider heard in the recording; empty where it heard none. */
  async hear(sound: HeardSound): Promise<string> {
    const key = await this.reach.keyOf(sound.providerId);
    const address = await this.hearingAddress(sound.providerId);

    if (key === null || address === null) {
      throw new Refusal(SPEECH_NOT_SET);
    }

    return this.send({
      address,
      key,
      sound,
    });
  }

  /** Where the provider hears a recording; `null` where its card holds no address. */
  private async hearingAddress(providerId: string): Promise<string | null> {
    const way = HEARING_WAYS[providerId];
    const machine = way.address ?? (await this.reach.addressOf(providerId));

    if (machine === null) {
      return null;
    }

    return `${atProtocol(machine, way.protocolPath)}${HEARING_PATH}`;
  }

  /** Puts the recording to the provider; a fault of its own is a refusal carrying its sentence. */
  private async send({ address, key, sound }: HearingCall): Promise<string> {
    const form = new FormData();
    const recording = new Blob([sound.audio], {
      type: sound.mimeType,
    });

    form.append("file", recording, HEARING_FILE_NAMES[sound.mimeType] ?? HEARING_FILE_NAME);
    form.append("model", sound.model);

    const answer = await this.post(address, key, form);

    if (!answer.ok) {
      throw new Refusal(SPEECH_HEARING_FAILED, this.sentenceOf(await answer.text(), answer.status));
    }

    const heard = <{ text?: unknown }>await answer.json();

    return typeof heard.text === "string" ? heard.text.trim() : "";
  }

  /** The request itself; a network that did not carry is the provider's fault, said in its own words. */
  private async post(address: string, key: string, form: FormData): Promise<Response> {
    try {
      return await fetch(address, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
        },
        body: form,
      });
    } catch (failure) {
      throw new Refusal(SPEECH_HEARING_FAILED, failure instanceof Error ? failure.message : String(failure));
    }
  }

  /** The provider's own sentence out of its answer: `error.message` where it is JSON, the text, or the status. */
  private sentenceOf(body: string, status: number): string {
    const said = this.parsed(body);
    const error = typeof said === "object" && said !== null ? (<{ error?: { message?: unknown } }>said).error : null;

    if (typeof error?.message === "string") {
      return error.message;
    }

    return body.trim() === "" ? String(status) : body.trim();
  }

  private parsed(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  /** The settings file as parsed, or `null` where it is missing or not JSON. */
  private async readHeld(): Promise<unknown> {
    try {
      return JSON.parse(await readFile(path.join(this.userDataDirectory, SPEECH_FILE_NAME), "utf8"));
    } catch {
      return null;
    }
  }

  private textOf(held: unknown, field: keyof SpeechSettings): string | null {
    if (typeof held !== "object" || held === null) {
      return null;
    }

    const value = (<Record<string, unknown>>held)[field];

    return typeof value === "string" && value !== "" ? value : null;
  }
}
