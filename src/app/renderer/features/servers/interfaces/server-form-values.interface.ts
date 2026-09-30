import type { McpSignIn } from "../../../interfaces";

/**
 * What the one form holds for both kinds of server. The head switch picks the half in use; the other half keeps what
 * was typed, and only the file holds the other kind's fields empty.
 */
export interface ServerFormValues {
  name: string;
  /** The switch in the form's head, and the first slot of the keyboard order. */
  isLocal: boolean;
  /** The line that starts a local server, run in the project's folder with no sandbox. */
  run: string;
  /** The address a remote server answers at. */
  address: string;
  /** Whether the server takes a token or is open to anyone. */
  signIn: McpSignIn;
  /** The environment variable names; their values stay in this machine's keychain. */
  env: string[];
}
