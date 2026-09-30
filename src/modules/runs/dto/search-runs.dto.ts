import { IsNotEmpty, IsString } from "class-validator";

/** One word looked for through a project's whole record. */
export class SearchRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  /** An empty field passes validation; the searcher finds nothing. */
  @IsString()
  declare query: string;
}
