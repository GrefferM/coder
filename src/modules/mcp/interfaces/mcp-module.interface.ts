import type { McpClient } from "../services";
import type { McpController } from "../controllers";

/** What `createMcpModule` hands back: the door a screen knocks on, and the client the turn calls through. */
export interface McpModule {
  controller: McpController;
  client: McpClient;
}
