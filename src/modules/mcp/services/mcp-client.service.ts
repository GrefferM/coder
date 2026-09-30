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
 * Every MCP server is reached through this client, held open once it answers and kept by id alone: a renamed or moved
 * server is the same server, two running the same line are two. Nothing is written to a file.
 */
export class McpClient {
  /** The machine's keychain, where a token and every environment value live, never the file. */
  constructor(private readonly secrets: McpSecretStore) {}

  private readonly live = new Map<string, Client>();
  /** What a server printed beside the protocol while starting, by server id. */
  private readonly printed = new Map<string, string[]>();
  /** What the calls to each server have come to since it was connected; the catalogue row is drawn from it. */
  private readonly calls = new McpCalls();

  /**
   * One look at a server, as the row and the opened list are drawn from it. A server that does not answer is drawn
   * fallen, with the words it failed with.
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
        // The memory of the last look is kept in this machine's database; the door that asked puts the two together.
        changedAt: null,
        wasCount: null,
        calls: this.calls.of(server.id),
      };
    } catch (failure) {
      return {
        serverId: server.id,
        isUp: false,
        // Nothing is reported from the last look; this is what it says now.
        functions: [],
        answeredAt: null,
        failure: String(failure),
        // A fall says nothing about the list; nobody is there to ask.
        changedAt: null,
        wasCount: null,
        calls: this.calls.of(server.id),
      };
    }
  }

  /** The functions a server hands over, asked of the server itself; started first if not up. */
  async functionsOf(server: ProjectMcpServerDto, directory: string): Promise<McpFunction[]> {
    const client = await this.held(server, directory);
    const answer = await client.listTools();

    return answer.tools.map((tool) => ({
      name: tool.name,
      // A server need not describe a function; the model gets the name alone.
      description: tool.description ?? "",
      parameters: tool.inputSchema,
    }));
  }

  /**
   * Calls one function of a server and returns what it said. A call that did not happen (server fell, or unknown
   * function) comes back named, not thrown.
   */
  async call(payload: McpCall): Promise<McpResult> {
    const result = await this.asked(payload);

    // The one place a call ends.
    this.calls.noted(payload.server.id, payload, result);

    return result;
  }

  /** One call's own answer, before it is counted. */
  private async asked(payload: McpCall): Promise<McpResult> {
    try {
      const client = await this.held(payload.server, payload.directory);
      const answer = await client.callTool(
        {
          name: payload.functionName,
          arguments: payload.arguments,
        },
        undefined,
        // A stop aborts the request in flight; the throw is caught below and the turn ends stopped.
        {
          signal: payload.signal,
        },
      );

      return {
        output: saidWhole(answer.content),
        // A server's own failure is the function's outcome, not a broken call.
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
    // Letting a server go forgets what its calls came to.
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

    // A new connection is a new chance.
    this.calls.forget(server.id);

    // A fallen server is noticed where it falls, so a dead connection is not held; only this connection releases its
    // own place.
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

    // The environment is settled before anything runs; a missing key is «не запуститься» and no process exists to say
    // so.
    const environment = await this.environment(server);
    const client = new Client({
      name: MCP_CLIENT_NAME,
      version: MCP_CLIENT_VERSION,
    });
    const transport = new StdioClientTransport({
      command,
      args,
      // Started in the project's folder, so relative paths in the line resolve.
      cwd: directory,
      env: environment,
      // Its stderr is the only thing that says why it will not start, so it is kept.
      stderr: "pipe",
    });
    // The connection is begun before stderr is listened to; the process does not exist until then.
    const connecting = client.connect(transport, {
      timeout: MCP_CONNECT_TIMEOUT_MS,
    });

    this.listen(server.id, transport);

    try {
      await connecting;
    } catch (failure) {
      // The library's error does not carry what the server printed on stderr, so it is added.
      throw new Error(this.withSaid(server.id, String(failure)), {
        cause: failure,
      });
    } finally {
      this.printed.delete(server.id);
    }

    return client;
  }

  /** A remote server is reached, not started; its token is read from the keychain at that moment and never held. */
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
   * The filtered environment every server gets (`HOME LOGNAME PATH SHELL TERM USER` and the like) plus the values held
   * for the declared names.
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

  /** What the token is carried in; nothing where the server asks for none. */
  private async opened(server: ProjectMcpServerDto): Promise<{ requestInit?: RequestInit }> {
    if (server.signIn !== "token") {
      return {};
    }

    const token = await this.secrets.value(`${MCP_TOKEN_PREFIX}${server.id}`);

    // Nothing to go with is its own answer, neither fallen nor a wrong address.
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

  /** Keeps the last lines a server printed beside the protocol; only the tail is held. */
  private listen(serverId: string, transport: StdioClientTransport): void {
    transport.stderr?.on("data", (chunk: Buffer) => {
      const lines = [...(this.printed.get(serverId) ?? []), ...String(chunk).split("\n")].filter(
        (line) => line.trim() !== "",
      );

      this.printed.set(serverId, lines.slice(-MCP_STDERR_LINES));
    });
  }

  /** The failure with what the server printed under it, if anything. */
  private withSaid(serverId: string, failure: string): string {
    const lines = this.printed.get(serverId) ?? [];

    return lines.length === 0 ? failure : `${failure}${MCP_SAID_SEPARATOR}${lines.join(MCP_SAID_JOIN)}`;
  }
}
