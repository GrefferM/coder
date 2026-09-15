import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { ProjectMcpServerDto } from "../../projects";

/** One look at a server — the server itself, and the folder a local one is started in. */
export class LookMcpServerDto {
  @IsString()
  @IsNotEmpty()
  declare directory: string;

  @ValidateNested()
  declare server: ProjectMcpServerDto;
}
