import { ValidateNested } from "class-validator";
import { ProjectMcpServerDto } from "../../projects";

/** One server whose run line is asked about or agreed to; the line is read off the server as the screen holds it. */
export class McpConsentDto {
  @ValidateNested()
  declare server: ProjectMcpServerDto;
}
