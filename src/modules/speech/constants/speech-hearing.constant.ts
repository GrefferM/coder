import type { HearingWay } from "../interfaces";

/** Where each recognising provider is reached: a fixed address, or `null` for the one its own card holds. */
export const HEARING_WAYS: Record<string, HearingWay> = {
  openai: {
    address: "https://api.openai.com",
    protocolPath: "/v1",
  },
  openrouter: {
    address: "https://openrouter.ai/api",
    protocolPath: "/v1",
  },
  "runpod-openai": {
    address: null,
    protocolPath: "/openai/v1",
  },
};

/** The path under the protocol that turns a recording into words. */
export const HEARING_PATH = "/audio/transcriptions";

/** The name the recording is sent under; the provider reads its type from it. */
export const HEARING_FILE_NAMES: Record<string, string> = {
  "audio/webm": "speech.webm",
  "audio/ogg": "speech.ogg",
  "audio/mp4": "speech.m4a",
  "audio/wav": "speech.wav",
};

/** The name a recording of any other type is sent under. */
export const HEARING_FILE_NAME = "speech.webm";
