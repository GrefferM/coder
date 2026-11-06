import type { SpeechSettings } from "../../../../../contracts";

/** Nothing chosen: what a machine that never wrote its speech holds. */
export const NOTHING_CHOSEN: SpeechSettings = {
  voiceName: null,
};

/** The recording's type where the recorder names none. */
export const RECORDING_MIME_TYPE = "audio/webm";

/** What stands between the parts of a recorder's type and its parameters. */
export const MIME_PARAMETERS_SEPARATOR = ";";
