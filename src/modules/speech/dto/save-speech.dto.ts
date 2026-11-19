import { IsBoolean, IsOptional, IsString } from "class-validator";

/** What this machine speaks and hears with; `null` where nothing is chosen. */
export class SaveSpeechDto {
  @IsOptional()
  @IsString()
  declare voiceName: string | null;

  @IsBoolean()
  declare isMacHearing: boolean;

  @IsOptional()
  @IsString()
  declare macLocale: string | null;
}
