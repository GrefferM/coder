import { Column, Entity, PrimaryColumn } from "typeorm";
import { MCP_DROPPED_SERVER_TABLE_NAME } from "../constants";

/**
 * The `mcp_dropped_servers` row — a server this machine deleted, whose keys are owed a sweep.
 *
 * It exists because the keys must outlive the deed by exactly the undo's thirty seconds, and an app closed
 * inside them would otherwise leave a token under an id nobody will ever name again. The row is the only thing
 * that makes the sweep **safe**: the keychain is the machine's and holds other projects' servers too, so nothing
 * is ever swept for being unknown — only for having been dropped here, on purpose.
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
