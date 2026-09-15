/** What the module needs from the machine to hold a secret: encryption tied to this user on this computer. */
export interface SecretCipher {
  isAvailable(): boolean;
  encrypt(value: string): Buffer;
  decrypt(encrypted: Buffer): string;
}
