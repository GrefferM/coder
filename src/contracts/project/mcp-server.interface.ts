import type { McpSignIn } from "./mcp-sign-in.type";

/**
 * One MCP server the project declares. The file holds only how to reach it; connection state, last answer and function
 * list are live. A token is never here: it goes to the machine's keychain.
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
   * Environment variable names a local server starts with, names only; values stay in the machine's keychain. The process
   * runs with a filtered environment plus these.
   */
  env: string[];
}
