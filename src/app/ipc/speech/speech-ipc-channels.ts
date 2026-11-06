import { HearSpeechDto, SaveSpeechDto, SpeechController } from "../../../modules/speech";
import type { IpcChannelMap } from "../register-ipc-channels";
import { HEAR_SPEECH_CHANNEL, SAVE_SPEECH_CHANNEL, SPEECH_SETTINGS_CHANNEL } from "../../../contracts";

/** Speech channels: what this machine speaks and hears with, and one recording turned into words. */
export const SPEECH_IPC_CHANNELS: IpcChannelMap<SpeechController> = {
  [SPEECH_SETTINGS_CHANNEL]: (controller) => controller.settings(),
  [SAVE_SPEECH_CHANNEL]: (controller, payload) => controller.save(Object.assign(new SaveSpeechDto(), payload)),
  [HEAR_SPEECH_CHANNEL]: (controller, payload) => controller.hear(Object.assign(new HearSpeechDto(), payload)),
};
