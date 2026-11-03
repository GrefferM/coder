import type { McpLook, ProjectMcpServer } from "../../../../../../../interfaces";

export interface ServerRowProps {
  server: ProjectMcpServer;
  /** What it said this time; null where it has not been asked yet or was let go. */
  look: McpLook | null;
  /** When this server's ask began, or null where it is not being asked; the clock counts up from it. */
  askingSince: number | null;
  /** How many agents hold any function of this server. */
  agentCount: number;
  /** The chevron leads to this server's own page. */
  onOpen: () => void;
  /** «ЗАПУСТИТИ»: let it go and start it afresh. */
  onRestart: () => void;
  /** «ЗУПИНИТИ»: let a standing local server's process go; its consent stays. */
  onStop: () => void;
  /** «СКАСУВАТИ»: let the process go and ask nothing. */
  onCancel: () => void;
  /** «УВІЙТИ» and «ВПИСАТИ»: open the form for a token or value. */
  onFill: () => void;
  /** «ПОКАЗАТИ ВИКЛИК»: hands the chat over to the call. */
  onShowCall: (callId: string) => Promise<boolean>;
}
