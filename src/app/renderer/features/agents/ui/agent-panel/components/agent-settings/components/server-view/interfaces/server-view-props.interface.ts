import type { McpFunction, ProjectMcpServer, ToolGrant } from "../../../../../../../../../interfaces";

export interface ServerViewProps {
  agentName: string;
  server: ProjectMcpServer;
  /** What the server offers now; a function it no longer names is not offered. */
  functions: McpFunction[];
  grants: ToolGrant[];
  /** Toggles one function; connecting the whole server is the section's act. */
  onToggle: (functionName: string) => void;
  onBack: () => void;
  onSave: () => Promise<void>;
}
