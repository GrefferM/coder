import type { McpLookMemory } from "./mcp-look-memory.interface";

export interface McpLookStore {
  of(serverId: string): Promise<McpLookMemory | null>;
  put(memory: McpLookMemory): Promise<void>;
}
