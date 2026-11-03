import type { McpConsent } from "./mcp-consent.interface";

export interface McpConsentStore {
  of(serverId: string): Promise<McpConsent | null>;
  put(consent: McpConsent): Promise<void>;
}
