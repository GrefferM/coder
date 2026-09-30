import { safeStorage } from "electron";
import type { SecretCipher } from "../../modules/secrets";

/** The `secrets` cipher, backed by Electron's `safeStorage` and its single key in the OS keychain. */
export class SafeStorageCipher implements SecretCipher {
  isAvailable(): boolean {
    return safeStorage.isEncryptionAvailable();
  }

  encrypt(value: string): Buffer {
    return safeStorage.encryptString(value);
  }

  decrypt(encrypted: Buffer): string {
    return safeStorage.decryptString(encrypted);
  }
}
