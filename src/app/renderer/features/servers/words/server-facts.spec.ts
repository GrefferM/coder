import { describe, expect, it } from "vitest";
import { serverFacts } from "./server-facts";
import type { McpLook, ProjectMcpServer } from "../../../interfaces";
import { NO_MCP_CALLS } from "../../../interfaces";

const SERVER: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "filesystem",
  isLocal: true,
  run: "npx server-filesystem .",
  address: "",
  signIn: "none",
  env: [],
};

function look(patch: Partial<McpLook> = {}): McpLook {
  return {
    serverId: SERVER.id,
    isUp: true,
    functions: [],
    answeredAt: 1_700_000_000_000,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
    ...patch,
  };
}

describe("serverFacts", () => {
  it("says what a local server is, how much it hands over and how many agents hold any of it", () => {
    expect(
      serverFacts(SERVER, {
        look: look(),
        clock: null,
        functionCount: 8,
        agentCount: 4,
      }),
    ).toBe("ЛОКАЛЬНИЙ · 8 ФУНКЦІЙ · 4 АГЕНТИ");
  });

  it("says a remote server is remote", () => {
    expect(
      serverFacts(
        {
          ...SERVER,
          isLocal: false,
        },
        {
          look: look(),
          clock: null,
          functionCount: 33,
          agentCount: 5,
        },
      ),
    ).toBe("ВІДДАЛЕНИЙ · 33 ФУНКЦІЇ · 5 АГЕНТІВ");
  });

  it("a fallen server says so in place of its kind, since that is the fact that matters just then", () => {
    expect(
      serverFacts(SERVER, {
        look: look({
          isUp: false,
        }),
        clock: null,
        functionCount: 12,
        agentCount: 1,
      }),
    ).toBe("ПРОЦЕС УПАВ · 12 ФУНКЦІЙ · 1 АГЕНТ");
  });

  it("a server that works for nobody says that in place of its kind, since it is the fact that matters", () => {
    // The connection is whole and the catalogue is true — «каталог сервер віддав, роботу — ні».
    expect(
      serverFacts(SERVER, {
        look: look({
          calls: {
            failedInARow: 3,
            hasWorked: false,
            lastFailure: {
              callId: "call-1",
              functionName: "browser_navigate",
              said: "Chromium distribution 'chrome' is not found",
              at: 1_700_000_000_000,
            },
          },
        }),
        clock: null,
        functionCount: 24,
        agentCount: 1,
      }),
    ).toBe("ЖИВИЙ · ЖОДНА ФУНКЦІЯ НЕ ВІДПОВІЛА · 24 ФУНКЦІЇ · 1 АГЕНТ");
  });

  it("a server whose last call failed says nothing of it in its facts, because the stripe says it", () => {
    expect(
      serverFacts(SERVER, {
        look: look({
          calls: {
            failedInARow: 1,
            hasWorked: false,
            lastFailure: {
              callId: "call-1",
              functionName: "browser_navigate",
              said: "Chromium distribution 'chrome' is not found",
              at: 1_700_000_000_000,
            },
          },
        }),
        clock: null,
        functionCount: 24,
        agentCount: 1,
      }),
    ).toBe("ЛОКАЛЬНИЙ · 24 ФУНКЦІЇ · 1 АГЕНТ");
  });

  it("a server being asked says so with a clock, and keeps no count of last time's functions", () => {
    // The number comes from an answer, and this one has not answered yet; the agents are ours to count.
    expect(
      serverFacts(SERVER, {
        look: look({
          isUp: false,
        }),
        clock: "00:24",
        functionCount: 12,
        agentCount: 2,
      }),
    ).toBe("ЗАПУСКАЄТЬСЯ · 00:24 · 2 АГЕНТИ");
  });

  it("a server nobody has raised says its list is unknown, and no number is invented for it", () => {
    // «33 ФУНКЦІЇ» without a rise would be a promise, and its kind is the least of it.
    expect(
      serverFacts(SERVER, {
        look: null,
        clock: null,
        functionCount: 0,
        agentCount: 0,
      }),
    ).toBe("ФУНКЦІЇ НЕВІДОМІ");
    // The grants stay counted through it: a person gave them, and the server was never asked about them.
    expect(
      serverFacts(SERVER, {
        look: null,
        clock: null,
        functionCount: 0,
        agentCount: 2,
      }),
    ).toBe("ФУНКЦІЇ НЕВІДОМІ · 2 АГЕНТИ");
  });

  it("leaves a count out rather than saying a zero", () => {
    expect(
      serverFacts(SERVER, {
        look: look(),
        clock: null,
        functionCount: 3,
        agentCount: 0,
      }),
    ).toBe("ЛОКАЛЬНИЙ · 3 ФУНКЦІЇ");
  });

  it("holds to the Ukrainian forms on the numbers that catch people out", () => {
    expect(
      serverFacts(SERVER, {
        look: look(),
        clock: null,
        functionCount: 11,
        agentCount: 21,
      }),
    ).toBe("ЛОКАЛЬНИЙ · 11 ФУНКЦІЙ · 21 АГЕНТ");
    expect(
      serverFacts(SERVER, {
        look: look(),
        clock: null,
        functionCount: 22,
        agentCount: 5,
      }),
    ).toBe("ЛОКАЛЬНИЙ · 22 ФУНКЦІЇ · 5 АГЕНТІВ");
  });
});
