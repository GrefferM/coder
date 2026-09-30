/** Machine-scoped view of a project: canvas place and scale, and the open section. */
export interface ProjectView {
  pan: {
    x: number;
    y: number;
  };
  scale: number;
  sectionId: string;
  isCollapsed: boolean;
  /** Whom the chat was aimed at; outlives the window. */
  aimedAgentId: string | null;
  /** Height the person pulled the field under the stream to; `null` if never pulled. */
  fieldHeight: number | null;
}
