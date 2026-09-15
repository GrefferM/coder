/** Which servers this machine dropped, and when — the only ids a sweep may ever touch. */
export interface McpDroppedStore {
  all(): Promise<{ serverId: string; droppedAt: number }[]>;
  put(serverId: string, droppedAt: number): Promise<void>;
  forget(serverIds: string[]): Promise<void>;
}
