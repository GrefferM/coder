import { IsNotEmpty, IsString } from "class-validator";

/** Every run of one project, taken by hand; the folder bounds it, the record holding other projects too. */
export class ForgetRunsDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
