import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  SECRETS_FILE_NAME,
  SECRET_HINT_BULLETS,
  SECRET_HINT_HEAD_LENGTH,
  SECRET_HINT_TAIL_LENGTH,
  SECRET_STORE_UNAVAILABLE,
} from "../constants";
import type { SecretCipher, SecretHint } from "../interfaces";
import type { RemoveSecretDto, SetSecretDto } from "../dto";
import { Refusal } from "../../../utils/refusals";

/** Secrets as one ciphertext file beside the app's database; the controller hands out only hints. */
export class SecretService {
  constructor(
    private readonly cipher: SecretCipher,
    private readonly userDataDirectory: string,
  ) {}

  async set(payload: SetSecretDto): Promise<SecretHint> {
    this.assertAvailable();

    const held = await this.read();

    held[payload.key] = this.cipher.encrypt(payload.value).toString("base64");
    await this.write(held);

    return {
      key: payload.key,
      hint: this.hint(payload.value),
    };
  }

  /** Removes one secret; a missing key is not an error. */
  async remove(payload: RemoveSecretDto): Promise<void> {
    const held = await this.read();

    if (!(payload.key in held)) {
      return;
    }

    delete held[payload.key];
    await this.write(held);
  }

  async hints(): Promise<SecretHint[]> {
    if (!this.cipher.isAvailable()) {
      return [];
    }

    const held = await this.read();

    return Object.entries(held).map(([key, encrypted]) => ({
      key,
      hint: this.hint(this.decrypt(encrypted)),
    }));
  }

  /** The plain value, for main-process callers only; null when not stored. */
  async value(key: string): Promise<string | null> {
    const held = await this.read();
    const encrypted = held[key];

    return encrypted === undefined ? null : this.decrypt(encrypted);
  }

  private hint(value: string): string {
    if (value.length <= SECRET_HINT_HEAD_LENGTH + SECRET_HINT_TAIL_LENGTH) {
      return SECRET_HINT_BULLETS;
    }

    const head = value.slice(0, SECRET_HINT_HEAD_LENGTH);
    const tail = value.slice(-SECRET_HINT_TAIL_LENGTH);

    return `${head}${SECRET_HINT_BULLETS}${tail}`;
  }

  /** A value that no longer decrypts reads as "". */
  private decrypt(encrypted: string): string {
    try {
      return this.cipher.decrypt(Buffer.from(encrypted, "base64"));
    } catch {
      return "";
    }
  }

  private assertAvailable(): void {
    if (!this.cipher.isAvailable()) {
      throw new Refusal(SECRET_STORE_UNAVAILABLE);
    }
  }

  private async read(): Promise<Record<string, string>> {
    try {
      return <Record<string, string>>JSON.parse(await readFile(this.filePath(), "utf8"));
    } catch {
      return {};
    }
  }

  private async write(held: Record<string, string>): Promise<void> {
    const filePath = this.filePath();
    const temporaryPath = `${filePath}.tmp`;

    await mkdir(path.dirname(filePath), {
      recursive: true,
    });
    await writeFile(temporaryPath, JSON.stringify(held, null, 2), "utf8");
    await rename(temporaryPath, filePath);
  }

  private filePath(): string {
    return path.join(this.userDataDirectory, SECRETS_FILE_NAME);
  }
}
