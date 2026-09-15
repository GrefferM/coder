import { IsNotEmpty, IsString } from "class-validator";

/** One word looked for through a project's whole record. */
export class SearchRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  /** An empty field is not a search, and the door lets it through: the searcher answers with nothing found. */
  @IsString()
  declare query: string;
}
