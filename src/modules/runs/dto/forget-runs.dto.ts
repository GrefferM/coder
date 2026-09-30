import { IsNotEmpty, IsString } from "class-validator";

/** Every run of one project, deleted by hand; bounded by the folder. */
export class ForgetRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
