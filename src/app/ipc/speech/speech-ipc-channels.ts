import { HearSpeechDto, SaveSpeechDto, SpeechController } from "../../../modules/speech";
import type { IpcChannelMap } from "../register-ipc-channels";
import {
  ALLOW_MAC_HEARING_CHANNEL,
  HEAR_SPEECH_CHANNEL,
  MAC_HEARING_LOCALES_CHANNEL,
  MAC_HEARING_PERMISSION_CHANNEL,
  SAVE_SPEECH_CHANNEL,
  SPEECH_SETTINGS_CHANNEL,
} from "../../../contracts";

/** Speech channels: what this machine speaks and hears with, one recording turned into words, and macOS's hearing. */
export const SPEECH_IPC_CHANNELS: IpcChannelMap<SpeechController> = {
  [SPEECH_SETTINGS_CHANNEL]: (controller) => controller.settings(),
  [SAVE_SPEECH_CHANNEL]: (controller, payload) => controller.save(Object.assign(new SaveSpeechDto(), payload)),
  [HEAR_SPEECH_CHANNEL]: (controller, payload) => controller.hear(Object.assign(new HearSpeechDto(), payload)),
  [MAC_HEARING_PERMISSION_CHANNEL]: (controller) => controller.macPermission(),
  [ALLOW_MAC_HEARING_CHANNEL]: (controller) => controller.allowMac(),
  [MAC_HEARING_LOCALES_CHANNEL]: (controller) => controller.macLocales(),
};
