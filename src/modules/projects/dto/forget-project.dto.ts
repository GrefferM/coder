import { IsNotEmpty, IsString } from "class-validator";

/** What forgetting a project takes: the folder to drop from this machine's list. */
export class ForgetProjectDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;
}
