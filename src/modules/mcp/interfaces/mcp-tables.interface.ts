import type { Repository } from "typeorm";
import type { McpDroppedServerEntity, McpServerConsentEntity, McpServerLookEntity } from "../entities";

export interface McpTables {
  looks: Repository<McpServerLookEntity>;
  dropped: Repository<McpDroppedServerEntity>;
  consents: Repository<McpServerConsentEntity>;
}
