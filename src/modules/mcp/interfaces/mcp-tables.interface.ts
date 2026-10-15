import type { Repository } from "typeorm";
import type { McpDroppedServerEntity, McpServerLookEntity } from "../entities";

export interface McpTables {
  looks: Repository<McpServerLookEntity>;
  dropped: Repository<McpDroppedServerEntity>;
}
