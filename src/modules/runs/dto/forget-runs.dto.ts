import { IsNotEmpty, IsString } from "class-validator";

/** Every ended run of one project, deleted by hand; a running one is left. */
export class ForgetRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
