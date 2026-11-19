import { SpeechController } from "./controllers";
import { MacHearing, SpeechService } from "./services";
import type { SpeechModule, SpeechReach } from "./interfaces";

/** Speech, with macOS heard through Coder Hearing at `hearingAppPath`. */
export function createSpeechModule(
  reach: SpeechReach,
  userDataDirectory: string,
  hearingAppPath: string,
): SpeechModule {
  const macHearing = new MacHearing(hearingAppPath);
  const speechService = new SpeechService(reach, userDataDirectory, macHearing);
  const speechController = new SpeechController(speechService);

  return {
    controller: speechController,
  };
}
