import type { AgentServerTool, ServerRunner } from "../interfaces";
import type { CallResult, CallStanding, ToolWay } from "../interfaces";
import type { ProjectMcpServer } from "../../../contracts";

/**
 * One call of a server's function. Nothing is checked and nothing pinned — the server owns the schema — so the
 * model's arguments go over as they came, and the record keeps what was asked and what was said.
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
      name: this.tool.name,
      arguments: given,
      pinned: [],
      // The record keeps the name the server wore at the call, because the project may rename it or let it go,
      // and a call read back months later still has to say where it went.
      serverId: this.server.id,
      serverName: this.server.name,
    };
  }

  /** A server's function is checked by nobody here: the server wrote that schema and this app has no standing to judge it. */
  refusal(): string | null {
    return null;
  }

  async make(callId: string, directory: string, signal: AbortSignal): Promise<CallResult> {
    const result = await this.servers.call({
      server: this.server,
      directory,
      functionName: this.tool.name,
      // The model's own arguments go over as they came, not the strings the row keeps.
      arguments: this.said,
      // What a server's calls came to has to lead back to the very call it is counting.
      callId,
      signal,
    });

    return {
      line: "",
      output: result.output,
      exitCode: null,
      // «функція є, але сервер сказав "ні"» — his words go to the model whole, and the call says so.
      isFailed: result.isFailed,
    };
  }
}
