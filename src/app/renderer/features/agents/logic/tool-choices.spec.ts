import { describe, expect, it } from "vitest";
import { toolChoices } from "./tool-choices";
import { aCommand } from "../../../testing";
import { handleOf, sourceOf } from "../../../interfaces";
import type { McpLook, ProjectMcpServer } from "../../../interfaces";
import { NO_MCP_CALLS } from "../../../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function aServer(patch: Partial<ProjectMcpServer> = {}): ProjectMcpServer {
  return {
    id: SERVER_ID,
    name: "github-mcp",
    isLocal: false,
    run: "",
    address: "https://mcp.example.com/sse",
    signIn: "token",
    env: [],
    ...patch,
  };
}

function aLook(names: string[], serverId = SERVER_ID): McpLook {
  return {
    serverId,
    isUp: true,
    functions: names.map((name) => ({
      name,
      description: `опис ${name}`,
      parameters: {},
    })),
    answeredAt: 1_700_000_000_000,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
  };
}

describe("toolChoices", () => {
  it("puts the commands first, by name, and every server's functions after them", () => {
    const choices = toolChoices(
      [
        aCommand({
          id: "command-2",
          name: "run_tests",
        }),
        aCommand({
          id: "command-1",
          name: "build_docs",
        }),
      ],
      [aServer()],
      {
        [SERVER_ID]: aLook(["pulls.create", "pulls.list"]),
      },
    );

    expect(choices.map((choice) => choice.name)).toEqual(["build_docs", "run_tests", "pulls.create", "pulls.list"]);
  });

  it("keeps a server's own order for its functions, since that order is the server's and not ours", () => {
    const choices = toolChoices([], [aServer()], {
      [SERVER_ID]: aLook(["z_last", "a_first", "m_middle"]),
    });

    expect(choices.map((choice) => choice.name)).toEqual(["z_last", "a_first", "m_middle"]);
  });

  it("divides the list by heads: the commands under one, each server under its own", () => {
    const choices = toolChoices(
      [
        aCommand({
          id: "command-1",
          name: "run_tests",
        }),
      ],
      [
        aServer(),
        aServer({
          id: OTHER_ID,
          name: "filesystem-mcp",
        }),
      ],
      {
        [SERVER_ID]: aLook(["pulls.create"]),
        [OTHER_ID]: aLook(["read_file"], OTHER_ID),
      },
    );

    expect(choices.map((choice) => choice.group)).toEqual(["commands", `server:${SERVER_ID}`, `server:${OTHER_ID}`]);
  });

  it("gives a server's function a handle of the server and the name together", () => {
    // The handle is the grant's own, so a row and a grant the agent holds are compared by one word.
    const [choice] = toolChoices([], [aServer()], {
      [SERVER_ID]: aLook(["pulls.create"]),
    });

    expect(choice.key).toBe(
      handleOf({
        kind: "mcp",
        id: SERVER_ID,
        functionName: "pulls.create",
      }),
    );
    expect(choice.serverId).toBe(SERVER_ID);
    expect(choice.commandId).toBeNull();
  });

  it("gives a command the same handle a grant on that command carries", () => {
    const [choice] = toolChoices(
      [
        aCommand({
          id: "command-1",
          name: "run_tests",
        }),
      ],
      [],
      {},
    );

    expect(choice.key).toBe(
      handleOf(
        sourceOf({
          id: "grant-1",
          source: "command",
          commandId: "command-1",
          pinned: [],
        }),
      ),
    );
  });

  it("offers nothing from a server that did not answer, rather than what it handed over last time", () => {
    // A tick on a function nobody can call would be a promise the turn cannot keep.
    expect(toolChoices([], [aServer()], {})).toEqual([]);
  });

  it("takes the same function name on two servers as two different rows", () => {
    const choices = toolChoices(
      [],
      [
        aServer(),
        aServer({
          id: OTHER_ID,
          name: "filesystem-mcp",
        }),
      ],
      {
        [SERVER_ID]: aLook(["search"]),
        [OTHER_ID]: aLook(["search"], OTHER_ID),
      },
    );

    expect(choices).toHaveLength(2);
    expect(new Set(choices.map((choice) => choice.key)).size).toBe(2);
  });
});
