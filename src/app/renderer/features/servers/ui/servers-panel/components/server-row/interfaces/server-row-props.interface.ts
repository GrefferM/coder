import type { McpLook, ProjectMcpServer } from "../../../../../../../interfaces";

export interface ServerRowProps {
  server: ProjectMcpServer;
  /** What it said this time; nothing at all where it has not been asked yet. */
  look: McpLook | null;
  /**
   * The moment this server's ask began, or nothing where it is not being asked. It is a moment and not
   * a yes-or-no because the row counts a clock up from it, and says a second line on the twentieth second.
   */
  askingSince: number | null;
  /** How many agents hold any function of this server. */
  agentCount: number;
  /** The chevron leads to this server's own page, not to a card opened inside the row. */
  onOpen: () => void;
  /** «ЗАПУСТИТИ»: let it go and start it afresh. */
  onRestart: () => void;
  /** «СКАСУВАТИ»: give the place back at once — let the process go and ask nothing. */
  onCancel: () => void;
  /** «УВІЙТИ» and «ВПИСАТИ» both open the form, which is where a token and a value are typed. */
  onFill: () => void;
  /** «ПОКАЗАТИ ВИКЛИК» — hands the chat over to the call the row is talking about. */
  onShowCall: (callId: string) => void;
}
