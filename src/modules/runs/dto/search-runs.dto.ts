import { IsNotEmpty, IsString } from "class-validator";

export class SearchRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  /** An empty field passes validation; the searcher finds nothing. */
  @IsString()
  declare query: string;
}
