import { SpeechController } from "./controllers";
import { MacHearing, SpeechService } from "./services";
import type { SpeechModule, SpeechModuleParts } from "./interfaces";

/** Speech, with macOS heard through Coder Hearing. */
export function createSpeechModule({ reach, userDataDirectory, hearingAppPath }: SpeechModuleParts): SpeechModule {
  const macHearing = new MacHearing(hearingAppPath);
  const speechService = new SpeechService(reach, userDataDirectory, macHearing);
  const speechController = new SpeechController(speechService);

  return {
    controller: speechController,
  };
}
