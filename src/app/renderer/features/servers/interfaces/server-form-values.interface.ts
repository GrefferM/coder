import type { McpSignIn } from "../../../interfaces";

/**
 * What the one form holds, both kinds of server together. The switch in its head decides which
 * half is meant; the other half's fields keep whatever was typed in them, because switching back must not have
 * cost anything, and only the file is made to hold one kind's fields empty.
 */
export interface ServerFormValues {
  name: string;
  /** The switch in the head of the form, and the first slot of the keyboard's road. */
  isLocal: boolean;
  /** The line that starts a local server, run in the project's folder — there is no sandbox. */
  run: string;
  /** The address a remote server answers at. */
  address: string;
  /** Whether the server takes a token, or is open to anyone who reaches it. */
  signIn: McpSignIn;
  /** The names of the environment variables; every value of them stays in this machine's keychain. */
  env: string[];
}
