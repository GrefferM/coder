import { McpClient, McpConsents, McpMemory, McpSecrets } from "./services";
import { McpController } from "./controllers";
import { TypeormMcpConsentStore, TypeormMcpDroppedStore, TypeormMcpLookStore, mcpTablesOf } from "./stores";
import type { DataSource } from "typeorm";
import type { McpModule, McpSecretStore } from "./interfaces";

export function createMcpModule(secrets: McpSecretStore, dataSource: DataSource): McpModule {
  const tables = mcpTablesOf(dataSource);
  const droppedStore = new TypeormMcpDroppedStore(tables.dropped);
  const lookStore = new TypeormMcpLookStore(tables.looks);
  const consentStore = new TypeormMcpConsentStore(tables.consents);
  const consents = new McpConsents(consentStore);
  const client = new McpClient(secrets, consents);
  const mcpSecrets = new McpSecrets(secrets, droppedStore);
  const memory = new McpMemory(lookStore);

  return {
    controller: new McpController(client, mcpSecrets, memory, consents),
    client,
  };
}
