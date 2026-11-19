import {
  ALLOW_MAC_HEARING_CHANNEL,
  HEAR_SPEECH_CHANNEL,
  MAC_HEARING_LOCALES_CHANNEL,
  MAC_HEARING_PERMISSION_CHANNEL,
  OPEN_MICROPHONE_SETTINGS_CHANNEL,
  OPEN_SPEECH_SETTINGS_CHANNEL,
  RECORDING_SOUND_CHANNEL,
  SAVE_SPEECH_CHANNEL,
  SPEECH_SETTINGS_CHANNEL,
} from "../../../../../contracts";
import { NOTHING_CHOSEN } from "../constants";
import type { HeardSound, MacPermission, SpeechSettings } from "../../../../../contracts";

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

/** The sound of a recording kept with a question, by its id; `null` when the record holds none under it. */
export async function recordingSound(id: string): Promise<Uint8Array | null> {
  return window.electronApi.invoke(RECORDING_SOUND_CHANNEL, {
    id,
  });
}

/** Opens the system's page of who may recognise speech. */
export async function openSpeechSettings(): Promise<void> {
  await window.electronApi.invoke(OPEN_SPEECH_SETTINGS_CHANNEL);
}

/** Whether macOS lets Coder recognise speech. */
export async function macHearingPermission(): Promise<MacPermission> {
  return window.electronApi.invoke(MAC_HEARING_PERMISSION_CHANNEL);
}

/** Has macOS ask the person once; answers as `macHearingPermission`. */
export async function allowMacHearing(): Promise<MacPermission> {
  return window.electronApi.invoke(ALLOW_MAC_HEARING_CHANNEL);
}

/** The languages macOS recognises on this machine, as locales. */
export async function macHearingLocales(): Promise<string[]> {
  return window.electronApi.invoke(MAC_HEARING_LOCALES_CHANNEL);
}
