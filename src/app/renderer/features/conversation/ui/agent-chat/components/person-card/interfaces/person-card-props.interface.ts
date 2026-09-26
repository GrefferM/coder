import type { AttachedFile } from "../../../../../interfaces";

export interface PersonCardProps {
  text: string;
  at: Date;
  /** The files and folders attached to this question, for the «ПРИКРІПЛЕНО:» row; none where empty. */
  attached: AttachedFile[];
  /** The way into this question's own pass, where it has a walk to show. */
  onDebug: (() => void) | null;
  /** This card is where the search stopped — it wears the edge that says so. */
  isFound?: boolean;
  /** The word the stream's own search is looking for, lit inside these words; empty where none is. */
  looked?: string;
}
