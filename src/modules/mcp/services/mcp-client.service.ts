import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport, getDefaultEnvironment } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  MCP_CLIENT_NAME,
  MCP_CLIENT_VERSION,
  MCP_CONNECT_TIMEOUT_MS,
  MCP_ENV_PREFIX,
  MCP_ENV_VALUE_MISSING,
  MCP_FAILED_PREFIX,
  MCP_SAID_JOIN,
  MCP_SAID_SEPARATOR,
  MCP_SERVER_UNREACHABLE,
  MCP_STDERR_LINES,
  MCP_TOKEN_MISSING,
  MCP_TOKEN_PREFIX,
  MCP_TOKEN_SCHEME,
} from "../constants";
import { runParts, saidWhole } from "../logic";
import { McpCalls } from "./mcp-calls.service";
import type { McpCall, McpFunction, McpLook, McpResult, McpSecretStore } from "../interfaces";
import type { ProjectMcpServer } from "../interfaces";
import type { ProjectMcpServerDto } from "../../projects";
import { Refusal } from "../../../utils/refusals";

/**
 * Every MCP server is reached through this one client, held open once it answers and kept by its id alone: one
 * renamed or moved to another address is the same server, and two running the same line are two.
 *
 * Written to no file — the connection and the list of functions are asked of the server itself.
 */
export class McpClient {
  /** The machine's keychain, where a token and every environment value are — never the file. */
  constructor(private readonly secrets: McpSecretStore) {}

  private readonly live = new Map<string, Client>();
  /** What a server printed beside the protocol while it was starting, by server id; kept only until it has. */
  private readonly printed = new Map<string, string[]>();
  /** What the calls to each server have come to since it was connected; the catalogue's row is drawn from it. */
  private readonly calls = new McpCalls();

  /**
   * One look at a server, as the row and the opened list are drawn from it. A server that does not
   * answer is not an error to anybody: it is drawn fallen, with the words it failed with, and «ЗАПУСТИТИ» beside it.
   */
  async look(server: ProjectMcpServer, directory: string): Promise<McpLook> {
    try {
      const functions = await this.functionsOf(server, directory);

      return {
        serverId: server.id,
        isUp: true,
        functions,
        answeredAt: Date.now(),
        failure: null,
        // The memory of the last look is not the client's: it is asked of this machine's own database, and the
        // door that asked for the look puts the two together.
        changedAt: null,
        wasCount: null,
        calls: this.calls.of(server.id),
      };
    } catch (failure) {
      return {
        serverId: server.id,
        isUp: false,
        // What it handed over last time is not repeated as if it still did: this is what it says now, and it is none.
        functions: [],
        answeredAt: null,
        failure: String(failure),
        // A fall says nothing about the list: it did not go to zero, there is simply nobody there to ask.
        changedAt: null,
        wasCount: null,
        calls: this.calls.of(server.id),
      };
    }
  }

  /** The functions a server hands over, asked of the server itself; it is started first if it is not up. */
  async functionsOf(server: ProjectMcpServerDto, directory: string): Promise<McpFunction[]> {
    const client = await this.held(server, directory);
    const answer = await client.listTools();

    return answer.tools.map((tool) => ({
      name: tool.name,
      // A server need not describe a function; the model is then given the name alone rather than a made-up line.
      description: tool.description ?? "",
      parameters: tool.inputSchema,
    }));
  }

  /**
   * Calls one function of a server and brings back what it said. A call that did not happen — the server fell, or
   * never knew the function — comes back named rather than thrown, so a turn is not lost over one function.
   */
  async call(payload: McpCall): Promise<McpResult> {
    const result = await this.asked(payload);

    // The row's state is a fact about calls, and this is the one place where a call ends.
    this.calls.noted(payload.server.id, payload, result);

    return result;
  }

  /** One call's own answer, before it is counted. */
  private async asked(payload: McpCall): Promise<McpResult> {
    try {
      const client = await this.held(payload.server, payload.directory);
      const answer = await client.callTool({
        name: payload.functionName,
        arguments: payload.arguments,
      });

      return {
        output: saidWhole(answer.content),
        // A server says a failure of its own in the answer; it is the function's outcome, not a broken call.
        isFailed: answer.isError === true,
      };
    } catch (failure) {
      return {
        output: `${MCP_FAILED_PREFIX} ${String(failure)}`,
        isFailed: true,
      };
    }
  }

  /** Whether this server is up right now. */
  isUp(serverId: string): boolean {
    return this.live.has(serverId);
  }

  /** Lets one server go; a local one's process ends with the connection. */
  async close(serverId: string): Promise<void> {
    const client = this.live.get(serverId);

    if (client === undefined) {
      return;
    }

    this.live.delete(serverId);
    // Letting a server go takes what its calls came to with the connection they were made on.
    this.calls.forget(serverId);
    await client.close();
  }

  /** Lets every server go; the app closing is the one caller. */
  async closeAll(): Promise<void> {
    for (const serverId of [...this.live.keys()]) {
      await this.close(serverId);
    }
  }

  /** The live connection to one server, started on first ask. */
  private async held(server: ProjectMcpServerDto, directory: string): Promise<Client> {
    const standing = this.live.get(server.id);

    if (standing !== undefined) {
      return standing;
    }

    const client = await this.started(server, directory);

    // A new connection is a new chance — what the old one's calls came to says nothing about it.
    this.calls.forget(server.id);

    // A server that falls is noticed where it falls: the connection says so, and holding a dead one would make
    // the next call fail for a reason nobody could see. Only this very connection lets go of its own place.
    client.onclose = () => {
      if (this.live.get(server.id) === client) {
        this.live.delete(server.id);
      }
    };

    this.live.set(server.id, client);

    return client;
  }

  /** Starts one server and shakes hands with it; a server that does not answer in time is taken as fallen. */
  private async started(server: ProjectMcpServerDto, directory: string): Promise<Client> {
    if (!server.isLocal) {
      return await this.reached(server);
    }

    const [command, ...args] = runParts(server.run);

    if (command === undefined) {
      throw new Refusal(MCP_SERVER_UNREACHABLE);
    }

    // What it will run with is settled before anything runs — a key missing is «не запуститься», and
    // the process must not exist to say so, or it says so later, elsewhere, in somebody else's words.
    const environment = await this.environment(server);
    const client = new Client({
      name: MCP_CLIENT_NAME,
      version: MCP_CLIENT_VERSION,
    });
    const transport = new StdioClientTransport({
      command,
      args,
      // The server is started where the project stands, so a line naming a relative path means what it says.
      cwd: directory,
      env: environment,
      // What the server prints beside the protocol is the one thing that says why it will not start, so it is kept.
      stderr: "pipe",
    });
    // The connection is begun before its stderr is listened to, because the process does not exist until it is.
    const connecting = client.connect(transport, {
      timeout: MCP_CONNECT_TIMEOUT_MS,
    });

    this.listen(server.id, transport);

    try {
      await connecting;
    } catch (failure) {
      // A server that would not start has said why on its stderr, and by itself the library's error does not.
      throw new Error(this.withSaid(server.id, String(failure)), {
        cause: failure,
      });
    } finally {
      this.printed.delete(server.id);
    }

    return client;
  }

  /**
   * A remote server is not started but reached, and the token that opens it is read from this machine's keychain
   * at the moment of reaching — never held here, never written near the project.
   */
  private async reached(server: ProjectMcpServerDto): Promise<Client> {
    if (server.address === "") {
      throw new Refusal(MCP_SERVER_UNREACHABLE);
    }

    const client = new Client({
      name: MCP_CLIENT_NAME,
      version: MCP_CLIENT_VERSION,
    });

    await client.connect(new StreamableHTTPClientTransport(new URL(server.address), await this.opened(server)), {
      timeout: MCP_CONNECT_TIMEOUT_MS,
    });

    return client;
  }

  /**
   * The filtered environment every server gets — `HOME LOGNAME PATH SHELL TERM USER` and their like — plus the
   * values this machine holds for the declared names. A project opened elsewhere has the names and no keys.
   */
  private async environment(server: ProjectMcpServerDto): Promise<Record<string, string>> {
    const given: Record<string, string> = getDefaultEnvironment();

    for (const name of server.env) {
      const value = await this.secrets.value(`${MCP_ENV_PREFIX}${server.id}:${name}`);

      if (value === null || value === "") {
        throw new Refusal(`${MCP_ENV_VALUE_MISSING}: ${name}`);
      }

      given[name] = value;
    }

    return given;
  }

  /** What the token is carried in, and nothing at all where the server asks for none. */
  private async opened(server: ProjectMcpServerDto): Promise<{ requestInit?: RequestInit }> {
    if (server.signIn !== "token") {
      return {};
    }

    const token = await this.secrets.value(`${MCP_TOKEN_PREFIX}${server.id}`);

    // Nothing to go with is its own answer: neither a fallen server nor a wrong address, and said as itself.
    if (token === null || token === "") {
      throw new Refusal(MCP_TOKEN_MISSING);
    }

    return {
      requestInit: {
        headers: {
          Authorization: `${MCP_TOKEN_SCHEME} ${token}`,
        },
      },
    };
  }

  /** Keeps the last of what a server printed beside the protocol; only the tail is of any use, so only it is held. */
  private listen(serverId: string, transport: StdioClientTransport): void {
    transport.stderr?.on("data", (chunk: Buffer) => {
      const lines = [...(this.printed.get(serverId) ?? []), ...String(chunk).split("\n")].filter(
        (line) => line.trim() !== "",
      );

      this.printed.set(serverId, lines.slice(-MCP_STDERR_LINES));
    });
  }

  /** The failure with what the server printed under it, where it printed anything at all. */
  private withSaid(serverId: string, failure: string): string {
    const lines = this.printed.get(serverId) ?? [];

    return lines.length === 0 ? failure : `${failure}${MCP_SAID_SEPARATOR}${lines.join(MCP_SAID_JOIN)}`;
  }
}
