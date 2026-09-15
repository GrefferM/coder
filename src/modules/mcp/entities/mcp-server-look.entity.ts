import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { MCP_SERVER_LOOK_TABLE_NAME } from "../constants";

/**
 * The `mcp_server_looks` row — what this machine saw one server hand over last time, and when that last changed.
 *
 * The key is the server's own id and nothing else (the first rule). A project folder is not part of it: the id is
 * the server's, and two folders naming the same id are the same server by every rule the app has.
 */
@Entity(MCP_SERVER_LOOK_TABLE_NAME)
export class McpServerLookEntity {
  @PrimaryColumn({
    type: "varchar",
  })
  declare serverId: string;

  // The names it handed over, as JSON: a list of the same length with one name swapped is a changed list.
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
