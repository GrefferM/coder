import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { MCP_SERVER_LOOK_TABLE_NAME } from "../constants";

/**
 * The `mcp_server_looks` row: what this machine saw one server hand over last time, and when that last changed. Keyed
 * by the server's id alone, not by project folder.
 */
@Entity(MCP_SERVER_LOOK_TABLE_NAME)
export class McpServerLookEntity {
  @PrimaryColumn({
    type: "varchar",
  })
  declare serverId: string;

  // The names it handed over, as JSON; a same-length list with one name swapped is a changed list.
  @Column({
    type: "text",
  })
  declare names: string;

  @Column({
    type: "integer",
    nullable: true,
  })
  declare changedAt: number | null;

  @Column({
    type: "integer",
    nullable: true,
  })
  declare wasCount: number | null;

  @UpdateDateColumn()
  declare updatedAt: Date;
}
