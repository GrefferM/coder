import { Column, Entity, PrimaryColumn } from "typeorm";
import { MCP_DROPPED_SERVER_TABLE_NAME } from "../constants";

/**
 * The `mcp_dropped_servers` row: a server this machine deleted, whose keys are owed a sweep. Only this row makes a
 * sweep safe: the keychain also holds other projects' servers.
 */
@Entity(MCP_DROPPED_SERVER_TABLE_NAME)
export class McpDroppedServerEntity {
  @PrimaryColumn({
    type: "varchar",
  })
  declare serverId: string;

  @Column({
    type: "integer",
  })
  declare droppedAt: number;
}
