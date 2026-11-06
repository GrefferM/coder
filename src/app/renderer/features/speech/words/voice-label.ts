import { VOICE_NAME_SEPARATOR } from "../constants";
import type { MachineVoice } from "../interfaces";

/** «Lesya · uk-UA»: a voice by its name and its language. */
export function voiceLabel(voice: MachineVoice): string {
  return `${voice.name}${VOICE_NAME_SEPARATOR}${voice.lang}`;
}
