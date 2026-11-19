/** The providers that turn speech into words, in offering order. */
export const SPEECH_LISTEN_PROVIDER_IDS: string[] = ["openai", "openrouter", "runpod-openai"];

/** The hearing of macOS itself, on this machine: no catalogue model, no key, no network for most languages. */
export const MAC_HEARING_ID = "macos";

/** How fast a voice may read: from half its own pace to twice it, a tenth at a step. */
export const VOICE_RATE_LEAST = 0.5;
export const VOICE_RATE_MOST = 2;
export const VOICE_RATE_STEP = 0.1;
