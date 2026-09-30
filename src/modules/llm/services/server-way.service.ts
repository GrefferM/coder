import type { AgentServerTool, ServerRunner } from "../interfaces";
import type { CallResult, CallStanding, ToolWay } from "../interfaces";
import type { ProjectMcpServer } from "../../../contracts";

/**
 * One call of a server's function. Nothing is checked or pinned (the server owns the schema); the model's arguments go
 * over as they came.
 */
export class ServerWay implements ToolWay {
  constructor(
    private readonly tool: AgentServerTool,
    private readonly server: ProjectMcpServer,
    private readonly said: Record<string, unknown>,
    private readonly servers: ServerRunner,
  ) {}

  standing(): CallStanding {
    const given: Record<string, string> = {};

    for (const [name, value] of Object.entries(this.said)) {
      given[name] = String(value);
    }

    return {
      source: this.tool.source,
      name: this.tool.name,
      arguments: given,
      pinned: [],
      // The name the server wore at the call, kept in the record so a later rename or removal cannot lose where it
      // went.
      serverId: this.server.id,
      serverName: this.server.name,
    };
  }

  /** Unchecked here; the server owns its schema. */
  refusal(): string | null {
    return null;
  }

  async make(callId: string, directory: string, signal: AbortSignal): Promise<CallResult> {
    const result = await this.servers.call({
      server: this.server,
      directory,
      functionName: this.tool.name,
      // The model's own arguments, not the strings the row keeps.
      arguments: this.said,
      // Leads back to the call being counted.
      callId,
      signal,
    });

    return {
      line: "",
      output: result.output,
      exitCode: null,
      // «функція є, але сервер сказав "ні"»: its words go to the model whole, and the call says so.
      isFailed: result.isFailed,
    };
  }
}
