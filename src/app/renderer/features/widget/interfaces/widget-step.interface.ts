/** One agent's answer in a walk from the widget, as the output draws it (52e). */
export interface WidgetStep {
  /** The answer's own id. */
  id: string;
  agentId: string;
  text: string;
  /** When the turn began, or when it was said where the turn never carried its start. */
  at: string;
  /** Its place among the walk's answers, from 1: «КРОК N». */
  number: number;
  /** No line goes on from its agent: an end of the walk, the one read aloud. */
  isEnd: boolean;
  isFailure: boolean;
}
