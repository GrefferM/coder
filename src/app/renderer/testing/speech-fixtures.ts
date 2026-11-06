import type { HeardClip, ReadAloud, SoundPlayer, VoiceAsk } from "../features/speech";

/** A microphone at rest, its hands doing nothing; a spec about it passes the hands it watches. */
export function aVoiceAsk(patch: Partial<VoiceAsk> = {}): VoiceAsk {
  return {
    standing: "idle",
    startedAt: 0,
    levels: [],
    press: () => {},
    cancel: () => {},
    ...patch,
  };
}

/** A silent voice, its hands doing nothing; a spec about it passes the hands it watches. */
export function aReadAloud(patch: Partial<ReadAloud> = {}): ReadAloud {
  return {
    readingId: null,
    spoken: null,
    read: () => {},
    stop: () => {},
    ...patch,
  };
}

/** A player with nothing playing, its hands doing nothing; a spec about it passes the hands it watches. */
export function aSoundPlayer(patch: Partial<SoundPlayer> = {}): SoundPlayer {
  return {
    playingId: null,
    playedMs: 0,
    toggle: () => {},
    seek: () => {},
    stop: () => {},
    ...patch,
  };
}

/** A seven-second recording made on this screen. */
export function aHeardClip(patch: Partial<HeardClip> = {}): HeardClip {
  return {
    id: "clip-1",
    audio: new Uint8Array([1, 2, 3]),
    mimeType: "audio/webm",
    durationMs: 7_000,
    peaks: [0.2, 0.5, 1, 0.5],
    ...patch,
  };
}
