import type { McpLookMemory } from "./mcp-look-memory.interface";

/** Where the memory of the last look is kept; the service depends on this, not on a table. */
export interface McpLookStore {
  of(serverId: string): Promise<McpLookMemory | null>;
  put(memory: McpLookMemory): Promise<void>;
}
