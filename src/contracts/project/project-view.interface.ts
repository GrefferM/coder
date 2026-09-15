/** Where this machine was looking in a project: canvas place and scale, and the open section; machine-scoped. */
export interface ProjectView {
  pan: {
    x: number;
    y: number;
  };
  scale: number;
  sectionId: string;
  isCollapsed: boolean;
  /** Whom the chat was aimed at; the aim outlives the window, as the section does. */
  aimedAgentId: string | null;
  /** How tall the person pulled the field under the stream; nothing where it was never pulled. */
  fieldHeight: number | null;
}
