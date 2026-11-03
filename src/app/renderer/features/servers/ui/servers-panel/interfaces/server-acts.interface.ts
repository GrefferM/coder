/** Acts on one server of the list. */
export interface ServerActs {
  onRestart: (serverId: string) => void;
  /** «ЗУПИНИТИ»: lets a standing local server's process go, and the row stands unknown again. */
  onStop: (serverId: string) => void;
  /** «СКАСУВАТИ»: lets a server being raised go and frees its place at once. */
  onCancel: (serverId: string) => void;
  /** «ПЕРЕПИТАТИ»: asks a standing remote server for its list again. */
  onAskAgain: (serverId: string) => void;
  /** This server's page was opened, so the news of «34 → 33» is read. */
  onSeen: (serverId: string) => void;
  /** «ПОКАЗАТИ ВИКЛИК»: the catalogue's way into the chat, by call id. */
  onShowCall: (callId: string) => Promise<boolean>;
  /** Arms the question over one server. */
  onArm: (serverId: string) => void;
}
