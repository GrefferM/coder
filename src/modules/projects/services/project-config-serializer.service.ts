import { parse, stringify } from "yaml";
import { validateOrReject } from "class-validator";
import type { ValidationError } from "class-validator";
import {
  CommandToolGrantDto,
  McpToolGrantDto,
  PinnedArgumentDto,
  ProjectAgentDto,
  ProjectCommandDto,
  ProjectCommandParameterDto,
  ProjectConfigDto,
  ProjectLinkDto,
  ProjectMcpServerDto,
  ProjectModelDto,
  ProjectPromptDto,
} from "../dto";
import type { ToolGrantDto } from "../dto";
import {
  AGENT_MAX_CALLS_LEAST,
  AGENT_TEMPERATURE_LEAST,
  COMMAND_TOOL_SOURCE,
  MCP_TOOL_SOURCE,
  MODEL_ANSWER_CEILING_LEAST,
  MODEL_CONTEXT_CEILING_LEAST,
  PROJECT_CONFIG_VERSION,
} from "../constants";
import { LINKS_MAKE_RING, LINKS_REPEAT, PROJECT_FILE_BROKEN, PROJECT_FROM_NEWER_BUILD } from "../../../contracts";
import { brokenPlace } from "../logic";
import { Refusal } from "../../../utils/refusals";

/** Turns the project file's text into a validated config and back, with no file access of its own. */
export class ProjectConfigSerializer {
  /** Parses, raises to this build's version, and validates; a file with a newer version is refused. */
  async parse(text: string): Promise<ProjectConfigDto> {
    return this.toValidConfig(this.toSource(text));
  }

  /** The project file's text as a plain record; a version newer than this build's is refused, nothing is validated. */
  toSource(text: string): Record<string, unknown> {
    const parsed: unknown = parse(text);

    if (parsed === null || typeof parsed !== "object") {
      throw new Error("The project file is empty or is not a mapping.");
    }

    const source = <Record<string, unknown>>parsed;

    if (typeof source.version === "number" && source.version > PROJECT_CONFIG_VERSION) {
      throw new Refusal(PROJECT_FROM_NEWER_BUILD);
    }

    return source;
  }

  /** One part's file as a plain record (model, command or agent), without its id. */
  partSource(text: string): Record<string, unknown> {
    const parsed: unknown = parse(text);

    if (parsed === null || typeof parsed !== "object") {
      throw new Error("A described thing's file is empty or is not a mapping.");
    }

    return <Record<string, unknown>>parsed;
  }

  /** Rebuilds and validates a config; an IPC clone has lost its prototypes. */
  async toValidConfig(source: Record<string, unknown>): Promise<ProjectConfigDto> {
    const config = this.toConfig(source);

    // The validator's own words are English and name classes; the screen gets a refusal and the place instead.
    await validateOrReject(config).catch((errors: unknown) => {
      const place = brokenPlace(Array.isArray(errors) ? <ValidationError[]>errors : []);

      // The structured place crosses the bridge as the refusal's say; the screen turns it into a line.
      throw new Refusal(PROJECT_FILE_BROKEN, place === null ? "" : JSON.stringify(place));
    });

    // The link checks run whichever way the config arrived: read from the folder or saved over IPC.
    if (this.makeRing(config.links)) {
      throw new Refusal(LINKS_MAKE_RING);
    }

    if (this.repeat(config.links)) {
      throw new Refusal(LINKS_REPEAT);
    }

    return config;
  }

  /** Serializes a record back to YAML text. */
  text(source: unknown): string {
    return stringify(source, {
      lineWidth: 0,
    });
  }

  private toConfig(source: Record<string, unknown>): ProjectConfigDto {
    const config = new ProjectConfigDto();

    config.version = PROJECT_CONFIG_VERSION;
    config.name = <string>source.name;
    config.models = this.toList(source.models, (item) => this.toModel(item));
    config.prompts = this.toList(source.prompts, (item) => this.toPrompt(item));
    config.commands = this.toList(source.commands, (item) => this.toCommand(item));
    config.servers = this.toList(source.servers, (item) => this.toMcpServer(item));
    config.agents = this.toList(source.agents, (item) => this.toAgent(item));
    config.links = this.toList(source.links, (item) => this.toLink(item));

    return config;
  }

  /** A list of bare strings; absent reads as empty. */
  private toTextList(source: unknown): string[] {
    if (source === undefined || source === null) {
      return [];
    }

    if (!Array.isArray(source)) {
      throw new Error("Expected a list.");
    }

    return source.map((item) => <string>item);
  }

  private toList<TEntry>(source: unknown, toEntry: (item: Record<string, unknown>) => TEntry): TEntry[] {
    if (source === undefined || source === null) {
      return [];
    }

    if (!Array.isArray(source)) {
      throw new Error("Expected a list.");
    }

    return source.map((item) => toEntry(<Record<string, unknown>>item));
  }

  private toModel(source: Record<string, unknown>): ProjectModelDto {
    const model = new ProjectModelDto();

    model.id = <string>source.id;
    model.title = <string>source.title;
    model.provider = <string>source.provider;
    // A number missing or written wrong leaves the field empty and the file whole; the model says so itself.
    model.inputPrice = written(source.inputPrice, 0);
    model.outputPrice = written(source.outputPrice, 0);
    model.contextCeiling = written(source.contextCeiling, MODEL_CONTEXT_CEILING_LEAST);
    model.answerCeiling = written(source.answerCeiling, MODEL_ANSWER_CEILING_LEAST);

    return model;
  }

  private toPrompt(source: Record<string, unknown>): ProjectPromptDto {
    const prompt = new ProjectPromptDto();

    prompt.id = <string>source.id;
    prompt.name = <string>source.name;
    prompt.file = <string>source.file;
    // Absent when read from the file (the body lives in its own file); present when a save arrives over IPC.
    prompt.text = <string>(source.text ?? "");

    return prompt;
  }

  private toCommand(source: Record<string, unknown>): ProjectCommandDto {
    const command = new ProjectCommandDto();

    command.id = <string>source.id;
    command.name = <string>source.name;
    command.description = <string>source.description;
    command.run = <string>source.run;
    command.parameters = this.toList(source.parameters, (item) => this.toCommandParameter(item));

    return command;
  }

  private toCommandParameter(source: Record<string, unknown>): ProjectCommandParameterDto {
    const parameter = new ProjectCommandParameterDto();

    parameter.id = <string>source.id;
    parameter.name = <string>source.name;
    parameter.type = <ProjectCommandParameterDto["type"]>source.type;
    parameter.description = <string>source.description;
    parameter.isRequired = <boolean>source.isRequired;
    // Only an `enum` parameter lists allowed values; other types carry an empty list.
    parameter.values = this.toTextList(source.values);

    return parameter;
  }

  private toAgent(source: Record<string, unknown>): ProjectAgentDto {
    const agent = new ProjectAgentDto();

    agent.id = <string>source.id;
    agent.name = <string>source.name;
    agent.modelId = <string>source.modelId;
    agent.promptId = <string | null>(source.promptId ?? null);
    agent.tools = this.toList(source.tools, (item) => this.toToolGrant(item));
    agent.color = <string>source.color;
    agent.isActive = <boolean>source.isActive;
    agent.x = <number>source.x;
    agent.y = <number>source.y;
    agent.maxCalls = written(source.maxCalls, AGENT_MAX_CALLS_LEAST);
    agent.temperature = written(source.temperature, AGENT_TEMPERATURE_LEAST);

    return agent;
  }

  /** One server, as the file names the way to reach it and nothing that moves. */
  private toMcpServer(source: Record<string, unknown>): ProjectMcpServerDto {
    const server = new ProjectMcpServerDto();

    server.id = <string>source.id;
    server.name = <string>source.name;
    server.isLocal = <boolean>source.isLocal;
    // The other kind's field is empty, not absent: one shape reads either way round.
    server.run = <string>(source.run ?? "");
    server.address = <string>(source.address ?? "");
    // A local server signs in to nothing, so an unwritten way in is `none` and validation holds it there.
    server.signIn = <ProjectMcpServerDto["signIn"]>(source.signIn ?? "none");
    // Names and nothing else; a server declaring none is a server that needs no key to run.
    server.env = Array.isArray(source.env) ? source.env.map((name) => String(name)) : [];

    return server;
  }

  /** Reads one grant by its `source` kind; an unknown kind throws. */
  private toToolGrant(source: Record<string, unknown>): ToolGrantDto {
    const grantSource = <string>source.source;

    if (grantSource === COMMAND_TOOL_SOURCE) {
      return this.toCommandToolGrant(source);
    }

    if (grantSource === MCP_TOOL_SOURCE) {
      return this.toMcpToolGrant(source);
    }

    throw new Error("Unknown tool source.");
  }

  private toMcpToolGrant(source: Record<string, unknown>): McpToolGrantDto {
    const grant = new McpToolGrantDto();

    grant.id = <string>source.id;
    grant.source = MCP_TOOL_SOURCE;
    grant.serverId = <string>source.serverId;
    // The name the server gave the function, which is the only handle on it there is.
    grant.functionName = <string>source.functionName;

    return grant;
  }

  private toCommandToolGrant(source: Record<string, unknown>): CommandToolGrantDto {
    const grant = new CommandToolGrantDto();

    grant.id = <string>source.id;
    grant.source = COMMAND_TOOL_SOURCE;
    grant.commandId = <string>source.commandId;
    grant.pinned = this.toList(source.pinned, (item) => this.toPinnedArgument(item));

    return grant;
  }

  private toPinnedArgument(source: Record<string, unknown>): PinnedArgumentDto {
    const pinned = new PinnedArgumentDto();

    pinned.id = <string>source.id;
    pinned.parameterId = <string>source.parameterId;
    pinned.value = <string>source.value;

    return pinned;
  }

  /** Whether any line repeats an already drawn from->to pair. */
  private repeat(links: ProjectLinkDto[]): boolean {
    const drawn = new Set<string>();

    return links.some((link) => {
      const between = `${link.from}->${link.to}`;
      const twice = drawn.has(between);

      drawn.add(between);

      return twice;
    });
  }

  /** Whether the lines close a ring; twin of `wouldMakeCycle` in `src/app/renderer/features/links/logic`. */
  private makeRing(links: ProjectLinkDto[]): boolean {
    const walked = new Set<string>();
    const standing = new Set<string>();
    const ends = (agentId: string): string[] => links.filter((link) => link.from === agentId).map((link) => link.to);

    const walk = (agentId: string): boolean => {
      if (standing.has(agentId)) {
        return true;
      }

      if (walked.has(agentId)) {
        return false;
      }

      walked.add(agentId);
      standing.add(agentId);

      const found = ends(agentId).some((next) => walk(next));

      standing.delete(agentId);

      return found;
    };

    return links.some((link) => walk(link.from));
  }

  private toLink(source: Record<string, unknown>): ProjectLinkDto {
    const link = new ProjectLinkDto();

    link.id = <string>source.id;
    link.from = <string>source.from;
    link.to = <string>source.to;

    return link;
  }
}

/** A number as the file holds it, or nothing at all — anything below the least it may be is nothing. */
function written(value: unknown, least: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= least ? value : null;
}
