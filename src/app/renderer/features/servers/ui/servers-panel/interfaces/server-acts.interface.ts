/** What can be done to one server of the list, each named by what it does to it. */
export interface ServerActs {
  onRestart: (serverId: string) => void;
  /** «СКАСУВАТИ»: lets a server being raised go, and gives its place in the list back at once. */
  onCancel: (serverId: string) => void;
  /** «ПЕРЕПИТАТИ»: asks a standing remote server for its list again, without letting anything go. */
  onAskAgain: (serverId: string) => void;
  /** This server's page has been opened, so the news of «34 → 33» has been read. */
  onSeen: (serverId: string) => void;
  /** «ПОКАЗАТИ ВИКЛИК» — the catalogue's one way into the chat, by the call's own id. */
  onShowCall: (callId: string) => void;
  /** Arms the question over one server; the answer belongs to the section, not to the list. */
  onArm: (serverId: string) => void;
}
