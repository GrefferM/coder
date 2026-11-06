import { SpeechController } from "./controllers";
import { SpeechService } from "./services";
import type { SpeechModule, SpeechReach } from "./interfaces";

export function createSpeechModule(reach: SpeechReach, userDataDirectory: string): SpeechModule {
  const speechService = new SpeechService(reach, userDataDirectory);
  const speechController = new SpeechController(speechService);

  return {
    controller: speechController,
  };
}
