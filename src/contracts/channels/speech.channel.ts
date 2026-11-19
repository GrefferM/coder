/** What this machine speaks and hears with. */
export const SPEECH_SETTINGS_CHANNEL = "speech:settings";

/** Writes what this machine speaks and hears with, whole. */
export const SAVE_SPEECH_CHANNEL = "speech:save";

/** Turns one recording into words through the recognition provider. */
export const HEAR_SPEECH_CHANNEL = "speech:hear";

/** Whether macOS lets Coder recognise speech. */
export const MAC_HEARING_PERMISSION_CHANNEL = "speech:mac-permission";

/** Has macOS ask the person, once, to let Coder recognise speech. */
export const ALLOW_MAC_HEARING_CHANNEL = "speech:mac-allow";

/** The languages macOS recognises on this machine. */
export const MAC_HEARING_LOCALES_CHANNEL = "speech:mac-locales";
