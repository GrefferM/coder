import type { ProjectMcpServer } from "../../../../../interfaces";

/** The window of 36k: whose run line it asks about, and the ways to open and answer it. */
export interface ServerConsentState {
  /** The server whose line waits for an answer; null while no window stands. */
  asked: ProjectMcpServer | null;
  /** «ЗАПУСТИТИ»: raises a server whose line is agreed to, and asks first about one whose line is not. */
  raise: (serverId: string) => void;
  /** «ПОКАЗАТИ, ЩО ЗАПУСТИТЬСЯ»: opens the window over one server without raising anything. */
  ask: (serverId: string) => void;
  /** «Запустити»: agrees to the line as the window shows it, then raises the server. */
  agree: () => Promise<void>;
  /** «Не запускати» and Escape: the window goes and nothing changes. */
  decline: () => void;
}
