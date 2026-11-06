import type { ReadAloud, VoiceAsk } from "../features/speech";

/** A microphone at rest, its hands doing nothing; a spec about it passes the hands it watches. */
export function aVoiceAsk(patch: Partial<VoiceAsk> = {}): VoiceAsk {
  return {
    standing: "idle",
    startedAt: 0,
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
