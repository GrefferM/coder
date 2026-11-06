import type { AttachedFile } from "../../../../../interfaces";
import type { SoundPlayer, SoundTrack } from "../../../../../../speech";

export interface PersonCardProps {
  text: string;
  at: Date;
  /** Files and folders attached to this question, for the «ПРИКРІПЛЕНО:» row; empty for none. */
  attached: AttachedFile[];
  /** The recordings it was said with, as tracks under its words (4l); empty for a typed one. */
  tracks: SoundTrack[];
  player: SoundPlayer;
  /** The way into this question's pass; `null` when it has no walk to show. */
  onDebug: (() => void) | null;
  /** This card is where the search stopped, so it wears the edge. */
  isFound?: boolean;
  /** The word the stream's search looks for, lit inside these words; empty for none. */
  looked?: string;
}
