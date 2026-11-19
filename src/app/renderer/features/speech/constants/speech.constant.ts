import type { SpeechSettings } from "../../../../../contracts";

/** Nothing chosen: what a machine that never wrote its speech holds. */
export const NOTHING_CHOSEN: SpeechSettings = {
  voiceName: null,
  ukrainianVoiceName: null,
  voiceRate: null,
  ukrainianVoiceRate: null,
  isMacHearing: false,
  macLocale: null,
  macSecondLocale: null,
};

/** The recording's type where the recorder names none. */
export const RECORDING_MIME_TYPE = "audio/webm";

/** A voice's own pace. */
export const VOICE_RATE_OWN = 1;

/** The type of a recording laid again for macOS. */
export const WAV_MIME_TYPE = "audio/wav";

/** What stands between the parts of a recorder's type and its parameters. */
export const MIME_PARAMETERS_SEPARATOR = ";";

/** How often the microphone's loudness is taken while it records. */
export const LEVEL_EVERY_MS = 100;

/** How many of the latest moments the running wave keeps; older ones have gone past its left edge. */
export const LIVE_BARS = 120;

/** How many bars a kept recording's wave is drawn with (4j, 4l). */
export const CLIP_BARS = 46;

/** How often the OS is asked for its voices while it has handed none over. */
export const VOICES_ASK_EVERY_MS = 500;

/** What a Mac's window says of itself, where macOS itself can hear (38d). */
export const MAC_USER_AGENT_MARK = "Macintosh";
