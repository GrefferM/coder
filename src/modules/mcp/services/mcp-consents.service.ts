import type { McpConsentGate, McpConsentStore, ProjectMcpServer } from "../interfaces";

/**
 * Whether this machine agreed to start a server's run line (36k). The line is the key, word for word: a line changed in
 * the file is a line nobody here agreed to. A remote server runs nothing here and needs none.
 */
export class McpConsents implements McpConsentGate {
  constructor(private readonly store: McpConsentStore) {}

  async isGiven(server: ProjectMcpServer): Promise<boolean> {
    if (!server.isLocal) {
      return true;
    }

    const held = await this.store.of(server.id);

    return held !== null && held.run === server.run;
  }

  /** Agrees to the line as it stands; an earlier line of the same server is no longer agreed to. */
  async give(server: ProjectMcpServer): Promise<void> {
    if (!server.isLocal) {
      return;
    }

    await this.store.put({
      serverId: server.id,
      run: server.run,
      givenAt: Date.now(),
    });
  }
}
