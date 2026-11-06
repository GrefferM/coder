import { IsOptional, IsString } from "class-validator";

/** What this machine speaks with; `null` where nothing is chosen. */
export class SaveSpeechDto {
  @IsOptional()
  @IsString()
  declare voiceName: string | null;
}
