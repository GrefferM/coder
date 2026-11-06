import {
  HEAR_SPEECH_CHANNEL,
  OPEN_MICROPHONE_SETTINGS_CHANNEL,
  SAVE_SPEECH_CHANNEL,
  SPEECH_SETTINGS_CHANNEL,
} from "../../../../../contracts";
import { NOTHING_CHOSEN } from "../constants";
import type { HeardSound, SpeechSettings } from "../../../../../contracts";

/** What this machine speaks and hears with; an unreachable machine has nothing chosen. */
export async function readSpeech(): Promise<SpeechSettings> {
  try {
    return await window.electronApi.invoke(SPEECH_SETTINGS_CHANNEL);
  } catch {
    return NOTHING_CHOSEN;
  }
}

/** Writes what this machine speaks and hears with, whole. */
export async function saveSpeech(settings: SpeechSettings): Promise<void> {
  await window.electronApi.invoke(SAVE_SPEECH_CHANNEL, settings);
}

/** The words heard in one recording; a refusal is thrown with its code and the provider's sentence. */
export async function hearSpeech(sound: HeardSound): Promise<string> {
  return window.electronApi.invoke(HEAR_SPEECH_CHANNEL, sound);
}

/** Opens the system's page of who may use the microphone. */
export async function openMicrophoneSettings(): Promise<void> {
  await window.electronApi.invoke(OPEN_MICROPHONE_SETTINGS_CHANNEL);
}
