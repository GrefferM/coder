import { IsIn, IsInstance, IsNotEmpty, IsString } from "class-validator";
import { SPEECH_LISTEN_PROVIDER_IDS } from "../interfaces";

/** One recording, as the window recorded it, with the provider and model the project hears with. */
export class HearSpeechDto {
  @IsInstance(Uint8Array)
  declare audio: Uint8Array;

  @IsString()
  declare mimeType: string;

  @IsIn(SPEECH_LISTEN_PROVIDER_IDS)
  declare providerId: string;

  @IsString()
  @IsNotEmpty()
  declare model: string;
}
