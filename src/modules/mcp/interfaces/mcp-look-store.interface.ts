import type { McpLookMemory } from "./mcp-look-memory.interface";

/** Where the memory of the last look is kept; the service stands over this and never over a table. */
export interface McpLookStore {
  of(serverId: string): Promise<McpLookMemory | null>;
  put(memory: McpLookMemory): Promise<void>;
}
