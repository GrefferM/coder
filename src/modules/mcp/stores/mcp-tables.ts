import { McpDroppedServerEntity, McpServerLookEntity } from "../entities";
import type { DataSource } from "typeorm";
import type { McpTables } from "../interfaces";

/** The tables MCP keeps on this machine; the module and tests build their stores on this. */
export function mcpTablesOf(dataSource: DataSource): McpTables {
  return {
    looks: dataSource.getRepository(McpServerLookEntity),
    dropped: dataSource.getRepository(McpDroppedServerEntity),
  };
}
