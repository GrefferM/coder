import type { McpSignIn } from "./mcp-sign-in.type";

/**
 * One MCP server the project declares. The file holds only how to reach it: everything that moves — the state of
 * the connection, the hour of the last answer, the list of functions — is live and belongs to nobody's file.
 *
 * A token is never here either: it goes to this machine's keychain, and the file names only the way in.
 */
export interface ProjectMcpServer {
  id: string;
  name: string;
  /** A local one is a process this app starts; a remote one is an address it signs in to. */
  isLocal: boolean;
  /** The line that starts a local server; empty for a remote one. */
  run: string;
  /** The address a remote server answers at; empty for a local one. */
  address: string;
  /** How a remote server is signed in to. */
  signIn: McpSignIn;
  /**
   * The environment variables a local server is started with, **by name only** — the file goes into a repository,
   * and a key in it would be a key in a pull request. Each value stays in this machine's keychain, and the process
   * runs with a filtered environment plus these.
   */
  env: string[];
}
