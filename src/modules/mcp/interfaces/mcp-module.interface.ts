import type { McpClient } from "../services";
import type { McpController } from "../controllers";

export interface McpModule {
  controller: McpController;
  client: McpClient;
}
