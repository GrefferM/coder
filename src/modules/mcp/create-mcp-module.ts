import { McpClient, McpMemory, McpSecrets } from "./services";
import { McpController } from "./controllers";
import { TypeormMcpDroppedStore, TypeormMcpLookStore, mcpTablesOf } from "./stores";
import type { DataSource } from "typeorm";
import type { McpModule, McpSecretStore } from "./interfaces";

export function createMcpModule(secrets: McpSecretStore, dataSource: DataSource): McpModule {
  const client = new McpClient(secrets);
  const tables = mcpTablesOf(dataSource);

  return {
    controller: new McpController(
      client,
      new McpSecrets(secrets, new TypeormMcpDroppedStore(tables.dropped)),
      new McpMemory(new TypeormMcpLookStore(tables.looks)),
    ),
    client,
  };
}
