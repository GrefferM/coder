import { IsIn, IsInstance, IsNotEmpty, IsString } from "class-validator";
import { MAC_HEARING_ID, SPEECH_LISTEN_PROVIDER_IDS } from "../interfaces";

/** One recording, as the window recorded it, with who hears it: a provider and its model, or macOS and its language. */
export class HearSpeechDto {
  @IsInstance(Uint8Array)
  declare audio: Uint8Array;

  @IsString()
  declare mimeType: string;

  @IsIn([...SPEECH_LISTEN_PROVIDER_IDS, MAC_HEARING_ID])
  declare providerId: string;

  @IsString()
  @IsNotEmpty()
  declare model: string;
}
