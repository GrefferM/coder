import { PAUSE_ENDS_TAKE_MS, SPEECH_LEVEL } from "./constants";

/**
 * Whether a take has gone quiet after something was said (52d): its last moments, as long as the pause that ends a
 * take, all stand under speech, and some moment before them did not. Silence alone ends nothing.
 */
export function isPauseAfterSpeech(levels: number[], everyMs: number): boolean {
  const quiet = Math.ceil(PAUSE_ENDS_TAKE_MS / everyMs);

  if (levels.length <= quiet) {
    return false;
  }

  const said = levels.slice(0, -quiet).some((level) => level >= SPEECH_LEVEL);
  const isQuietNow = levels.slice(-quiet).every((level) => level < SPEECH_LEVEL);

  return said && isQuietNow;
}
