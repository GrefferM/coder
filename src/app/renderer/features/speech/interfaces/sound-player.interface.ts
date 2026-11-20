import type { SoundTrack } from "./sound-track.interface";

/** One recording playing for the whole window, and its hands. */
export interface SoundPlayer {
  /** The track playing; `null` while nothing plays. */
  playingId: string | null;
  /** How far that track is played. */
  playedMs: number;
  /** That track is held where it stood, to go on from there. */
  isPaused: boolean;
  /** «▶» plays the track from its start, or on from where it was paused; the pause on the one playing holds it. */
  toggle: (track: SoundTrack) => void;
  /** A press in the wave moves the track to that share of it and plays from there, a paused one too. */
  seek: (track: SoundTrack, share: number) => void;
  stop: () => void;
}
