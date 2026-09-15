import { McpDroppedServerEntity, McpServerLookEntity } from "../entities";
import type { DataSource } from "typeorm";
import type { McpTables } from "../interfaces";

/** The tables MCP keeps on this machine — the module and a test both stand their stores on this. */
export function mcpTablesOf(dataSource: DataSource): McpTables {
  return {
    looks: dataSource.getRepository(McpServerLookEntity),
    dropped: dataSource.getRepository(McpDroppedServerEntity),
  };
}
