import type { ProjectMcpServer } from "../../../../../interfaces";

/** The server whose run line waits for consent, and the folder it would start in. */
export interface ServerConsentProps {
  server: ProjectMcpServer;
  /** The project's root, where a local server is started. */
  directory: string;
  /** «Запустити»: agree to the line and raise the server. */
  onRun: () => void;
  /** «Не запускати» and Escape: nothing changes. */
  onDecline: () => void;
}
