import type { SoundPlayer, SoundTrack } from "../../../interfaces";

export interface SoundClipProps {
  track: SoundTrack;
  /** The one player of the window; the clip lights while it plays this track. */
  player: SoundPlayer;
  /** The × under the field; `null` on a question already sent, whose recording is a record. */
  onDrop: (() => void) | null;
}
