import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { VOICE_RATE_LEAST, VOICE_RATE_MOST } from "../interfaces";

/** What this machine speaks and hears with; `null` where nothing is chosen. */
export class SaveSpeechDto {
  @IsOptional()
  @IsString()
  declare voiceName: string | null;

  @IsOptional()
  @IsString()
  declare ukrainianVoiceName: string | null;

  @IsOptional()
  @IsNumber()
  @Min(VOICE_RATE_LEAST)
  @Max(VOICE_RATE_MOST)
  declare voiceRate: number | null;

  @IsOptional()
  @IsNumber()
  @Min(VOICE_RATE_LEAST)
  @Max(VOICE_RATE_MOST)
  declare ukrainianVoiceRate: number | null;

  @IsBoolean()
  declare isMacHearing: boolean;

  @IsOptional()
  @IsString()
  declare macLocale: string | null;

  @IsOptional()
  @IsString()
  declare macSecondLocale: string | null;
}
