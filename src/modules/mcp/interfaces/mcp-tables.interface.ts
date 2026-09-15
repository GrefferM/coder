import type { Repository } from "typeorm";
import type { McpDroppedServerEntity, McpServerLookEntity } from "../entities";

/** Every table MCP writes into on this machine, off one connection. */
export interface McpTables {
  looks: Repository<McpServerLookEntity>;
  dropped: Repository<McpDroppedServerEntity>;
}
