import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { AddCallDto } from "./add-call.dto";
import { AddHandoffDto } from "./add-handoff.dto";

/** One agent's turn, written when it ends: the agent as it stood then, what it said, and every call. */
export class AddStepDto {
  @IsUUID()
  declare runId: string;

  @IsUUID()
  declare questionId: string;

  /** The walk this turn ran in; every step of one walk carries the same id. */
  @IsUUID()
  declare walkId: string;

  @IsUUID()
  declare agentId: string;

  @IsString()
  @IsNotEmpty()
  declare agentName: string;

  @IsString()
  @IsNotEmpty()
  declare agentColor: string;

  @IsString()
  declare modelId: string;

  @IsString()
  declare model: string;

  @IsString()
  declare providerId: string;

  /** Nothing where the model carried no such number, so the turn keeps the gap instead of a made-up zero. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  declare inputPrice: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  declare outputPrice: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  declare contextCeiling: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  declare answerCeiling: number | null;

  @IsOptional()
  @IsString()
  declare promptId: string | null;

  @IsString()
  declare prompt: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  declare temperature: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  declare maxCalls: number | null;

  @IsString()
  declare asked: string;

  @IsString()
  declare said: string;

  /**
   * How the turn ended, in the screen's own word. The record holds no list of them: a list here could only fall
   * behind the screen's and refuse a turn the person already saw.
   */
  @IsString()
  @IsNotEmpty()
  declare state: string;

  @IsInt()
  @Min(0)
  declare inputTokens: number;

  @IsInt()
  @Min(0)
  declare outputTokens: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  declare money: number | null;

  @IsArray()
  @IsUUID(undefined, {
    each: true,
  })
  declare fromStepIds: string[];

  @IsArray()
  @ValidateNested({
    each: true,
  })
  declare handoffs: AddHandoffDto[];

  @IsInt()
  @Min(0)
  declare startedAt: number;

  @IsInt()
  @Min(0)
  declare endedAt: number;

  @IsArray()
  @ValidateNested({
    each: true,
  })
  declare calls: AddCallDto[];
}
