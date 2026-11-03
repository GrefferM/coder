import { Column, Entity, PrimaryColumn } from "typeorm";
import { MCP_SERVER_CONSENT_TABLE_NAME } from "../constants";

/**
 * The `mcp_server_consents` row: the run line this machine agreed to start for one server. Keyed by the server's id;
 * a line that differs from the one held has no consent.
 */
@Entity(MCP_SERVER_CONSENT_TABLE_NAME)
export class McpServerConsentEntity {
  @PrimaryColumn({
    type: "varchar",
  })
  declare serverId: string;

  @Column({
    type: "text",
  })
  declare run: string;

  @Column({
    type: "integer",
  })
  declare givenAt: number;
}
