import type { SoundTrack } from "./sound-track.interface";

/** One recording playing for the whole window, and its hands. */
export interface SoundPlayer {
  /** The track playing; `null` while nothing plays. */
  playingId: string | null;
  /** How far that track is played. */
  playedMs: number;
  /** «▶» plays the track from its start; «■» on the one playing stops it. */
  toggle: (track: SoundTrack) => void;
  /** A press in the wave plays the track from that share of it. */
  seek: (track: SoundTrack, share: number) => void;
  stop: () => void;
}
