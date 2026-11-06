import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { MODEL_KINDS } from "../../../contracts";
import type { ModelKind } from "../../../contracts";
import {
  MODEL_ANSWER_CEILING_LEAST,
  MODEL_ANSWER_CEILING_MOST,
  MODEL_CONTEXT_CEILING_LEAST,
  MODEL_CONTEXT_CEILING_MOST,
  MODEL_PRICE_LEAST,
} from "../constants";

/**
 * A model: which, what it does, its provider, cost per million tokens and two ceilings. An unwritten number is `null`
 * and never refuses the file.
 */
export class ProjectModelDto {
  @IsUUID()
  declare id: string;

  @IsString()
  @IsNotEmpty()
  declare title: string;

  @IsIn(MODEL_KINDS)
  declare kind: ModelKind;

  @IsString()
  @IsNotEmpty()
  declare provider: string;

  @IsOptional()
  @IsNumber()
  @Min(MODEL_PRICE_LEAST)
  declare inputPrice: number | null;

  @IsOptional()
  @IsNumber()
  @Min(MODEL_PRICE_LEAST)
  declare outputPrice: number | null;

  @IsOptional()
  @IsNumber()
  @Min(MODEL_CONTEXT_CEILING_LEAST)
  @Max(MODEL_CONTEXT_CEILING_MOST)
  declare contextCeiling: number | null;

  @IsOptional()
  @IsNumber()
  @Min(MODEL_ANSWER_CEILING_LEAST)
  @Max(MODEL_ANSWER_CEILING_MOST)
  declare answerCeiling: number | null;
}
