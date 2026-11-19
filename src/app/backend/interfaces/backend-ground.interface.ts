import type { SecretCipher } from "../../../modules/secrets";
import type { BackendVoices } from "./backend-voices.interface";

/** What a backend is built on: the user-data folder, the keychain's cipher, who is spoken to, and Coder Hearing. */
export interface BackendGround {
  userDataPath: string;
  cipher: SecretCipher;
  voices: BackendVoices;
  /** Coder Hearing, the app that hears speech with macOS. */
  hearingAppPath: string;
}
