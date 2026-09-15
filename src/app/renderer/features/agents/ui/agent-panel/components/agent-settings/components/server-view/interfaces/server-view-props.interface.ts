import type { McpFunction, ProjectMcpServer, ToolGrant } from "../../../../../../../../../interfaces";

export interface ServerViewProps {
  agentName: string;
  server: ProjectMcpServer;
  /** What the server hands over right now; a function it no longer names is not offered here. */
  functions: McpFunction[];
  grants: ToolGrant[];
  /** One function in or out — connecting the whole server is the section's own act, a step back. */
  onToggle: (functionName: string) => void;
  onBack: () => void;
  onSave: () => Promise<void>;
}
