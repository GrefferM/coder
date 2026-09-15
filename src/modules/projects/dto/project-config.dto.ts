import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from "class-validator";
import { ProjectAgentDto } from "./project-agent.dto";
import { ProjectCommandDto } from "./project-command.dto";
import { ProjectLinkDto } from "./project-link.dto";
import { ProjectMcpServerDto } from "./project-mcp-server.dto";
import { ProjectModelDto } from "./project-model.dto";
import { ProjectPromptDto } from "./project-prompt.dto";

/** The whole project file, as it is once parsed and raised to the version this build writes. */
export class ProjectConfigDto {
  @IsInt()
  @Min(1)
  declare version: number;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique((model: ProjectModelDto) => model.id)
  declare models: ProjectModelDto[];

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique((prompt: ProjectPromptDto) => prompt.id)
  declare prompts: ProjectPromptDto[];

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique((command: ProjectCommandDto) => command.name)
  @ArrayUnique((command: ProjectCommandDto) => command.id)
  declare commands: ProjectCommandDto[];

  // Servers are named in the catalogue beside commands, so two may not share a name either.
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique((server: ProjectMcpServerDto) => server.name)
  @ArrayUnique((server: ProjectMcpServerDto) => server.id)
  declare servers: ProjectMcpServerDto[];

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique((agent: ProjectAgentDto) => agent.id)
  declare agents: ProjectAgentDto[];

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @ArrayUnique((link: ProjectLinkDto) => link.id)
  declare links: ProjectLinkDto[];
}
