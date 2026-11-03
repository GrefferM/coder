import { McpServerConsentEntity } from "../entities";
import type { Repository } from "typeorm";
import type { McpConsent, McpConsentStore } from "../interfaces";

export class TypeormMcpConsentStore implements McpConsentStore {
  constructor(private readonly consents: Repository<McpServerConsentEntity>) {}

  async of(serverId: string): Promise<McpConsent | null> {
    return this.consents.findOneBy({
      serverId,
    });
  }

  async put(consent: McpConsent): Promise<void> {
    await this.consents.save(consent);
  }
}
