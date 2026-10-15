import { McpDroppedServerEntity, McpServerLookEntity } from "../entities";
import type { DataSource } from "typeorm";
import type { McpTables } from "../interfaces";

export function mcpTablesOf(dataSource: DataSource): McpTables {
  return {
    looks: dataSource.getRepository(McpServerLookEntity),
    dropped: dataSource.getRepository(McpDroppedServerEntity),
  };
}
