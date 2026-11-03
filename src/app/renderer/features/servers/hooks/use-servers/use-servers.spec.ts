import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useServers } from "./use-servers";
import { CLOSE_MCP_SERVER_CHANNEL, LOOK_MCP_SERVER_CHANNEL, SWEEP_MCP_KEYS_CHANNEL } from "../../../../../../contracts";
import { standInBridge } from "../../../../testing";
import type { ProjectMcpServer } from "../../../../interfaces";
import { NO_MCP_CALLS } from "../../../../interfaces";

const DIRECTORY = "/tmp/coder";

/** A remote server, the kind asked as the project opens. */
function aServer(patch: Partial<ProjectMcpServer> = {}): ProjectMcpServer {
  return {
    id: "99999999-9999-4999-8999-999999999999",
    name: "linear",
    isLocal: false,
    run: "",
    address: "https://mcp.linear.app/mcp",
    signIn: "none",
    env: [],
    ...patch,
  };
}

/** A local server, which nothing but a person starts (36k). */
function aLocalServer(patch: Partial<ProjectMcpServer> = {}): ProjectMcpServer {
  return aServer({
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "filesystem",
    isLocal: true,
    run: "npx server-filesystem .",
    address: "",
    ...patch,
  });
}

/** A machine that answers every look with a server that is up, and records what it was asked. */
function machine() {
  const asked: { channel: string; payload: unknown }[] = [];
  const invoke = vi.fn(async (channel: string, payload: unknown) => {
    asked.push({
      channel,
      payload,
    });

    if (channel !== LOOK_MCP_SERVER_CHANNEL) {
      return undefined;
    }

    const server = (<{ server: ProjectMcpServer }>payload).server;

    return {
      serverId: server.id,
      isUp: true,
      functions: [
        {
          name: "read_file",
          description: "Читає файл",
          parameters: {},
        },
      ],
      answeredAt: 1_700_000_000_000,
      failure: null,
      calls: NO_MCP_CALLS,
    };
  });

  standInBridge({
    invoke,
  });

  return asked;
}

const looks = <TOne extends { channel: string }>(asked: TOne[]) =>
  asked.filter((one) => one.channel === LOOK_MCP_SERVER_CHANNEL);
/** The walk to and from one server, without other traffic on the wire such as the key sweep. */
const walk = (asked: { channel: string }[]) =>
  asked
    .map((one) => one.channel)
    .filter((channel) => channel === LOOK_MCP_SERVER_CHANNEL || channel === CLOSE_MCP_SERVER_CHANNEL);

describe("useServers", () => {
  it("asks every server the project names what it hands over, by its id", async () => {
    const asked = machine();
    const { result } = renderHook(() => useServers(DIRECTORY, [aServer()]));

    await waitFor(() => expect(Object.keys(result.current.looks)).toHaveLength(1));

    expect(result.current.looks[aServer().id].functions.map((held) => held.name)).toEqual(["read_file"]);
    expect(looks(asked)).toHaveLength(1);
    expect(result.current.askingSince).toEqual({});
  });

  it("starts a server once, however often the project's list is handed over again", async () => {
    const asked = machine();
    const servers = [aServer()];
    const { result, rerender } = renderHook(() => useServers(DIRECTORY, servers));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    rerender();
    rerender();

    expect(looks(asked)).toHaveLength(1);
    expect(result.current.looks[aServer().id].isUp).toBe(true);
  });

  it("asks a newly declared server, and leaves the one already asked alone", async () => {
    const asked = machine();
    const other = aServer({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "github",
    });
    let servers = [aServer()];
    const { result, rerender } = renderHook(() => useServers(DIRECTORY, servers));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    servers = [aServer(), other];
    rerender();

    // Waits for the answers, not the asks.
    await waitFor(() => expect(Object.keys(result.current.looks).sort()).toEqual([other.id, aServer().id].sort()));
    expect(looks(asked)).toHaveLength(2);
  });

  it("forgets what a server said once the project no longer names it", async () => {
    machine();
    let servers = [aServer()];
    const { result, rerender } = renderHook(() => useServers(DIRECTORY, servers));

    await waitFor(() => expect(Object.keys(result.current.looks)).toHaveLength(1));

    servers = [];
    rerender();

    await waitFor(() => expect(result.current.looks).toEqual({}));
  });

  it("«ЗАПУСТИТИ» lets the server go first, and only then asks it again", async () => {
    const asked = machine();
    const { result } = renderHook(() => useServers(DIRECTORY, [aServer()]));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    act(() => result.current.restart(aServer().id));

    await waitFor(() => expect(looks(asked)).toHaveLength(2));

    // Order matters: asking a fallen server again without closing it asks the same dead process.
    expect(walk(asked)).toEqual([LOOK_MCP_SERVER_CHANNEL, CLOSE_MCP_SERVER_CHANNEL, LOOK_MCP_SERVER_CHANNEL]);
  });

  it("lets a redeclared server go and asks it afresh, dropping what the old one said", async () => {
    // The id stays but the launch changed: the old process and its refusal must not carry over.
    const asked = machine();
    let servers = [aServer()];
    const { rerender } = renderHook(() => useServers(DIRECTORY, servers));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    servers = [
      aServer({
        address: "https://mcp.linear.app/sse",
      }),
    ];
    rerender();

    await waitFor(() => expect(looks(asked)).toHaveLength(2));
    expect(walk(asked)).toEqual([LOOK_MCP_SERVER_CHANNEL, CLOSE_MCP_SERVER_CHANNEL, LOOK_MCP_SERVER_CHANNEL]);
  });

  it("leaves a server alone when only its name changed", async () => {
    // A rename does not restart a running server.
    const asked = machine();
    let servers = [aServer()];
    const { rerender } = renderHook(() => useServers(DIRECTORY, servers));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    servers = [
      aServer({
        name: "files",
      }),
    ];
    rerender();

    expect(walk(asked)).toEqual([LOOK_MCP_SERVER_CHANNEL]);
  });

  it("«СКАСУВАТИ» lets the process go, stops the waiting and keeps the late answer out", async () => {
    // An answer arriving after the ask was let go is dropped.
    let answer: (look: unknown) => void = () => {};
    const asked: string[] = [];
    const invoke = vi.fn(async (channel: string) => {
      asked.push(channel);

      if (channel !== LOOK_MCP_SERVER_CHANNEL) {
        return undefined;
      }

      return new Promise((settle) => {
        answer = settle;
      });
    });

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() => useServers(DIRECTORY, [aServer()]));

    await waitFor(() => expect(result.current.askingSince[aServer().id]).toBeTypeOf("number"));

    act(() => result.current.cancel(aServer().id));

    expect(result.current.askingSince).toEqual({});
    expect(asked).toContain(CLOSE_MCP_SERVER_CHANNEL);

    act(() =>
      answer({
        serverId: aServer().id,
        isUp: true,
        functions: [],
        answeredAt: 1_700_000_000_000,
        failure: null,
        calls: NO_MCP_CALLS,
      }),
    );

    await waitFor(() => expect(result.current.askingSince).toEqual({}));
    expect(result.current.looks).toEqual({});
  });

  it("pays the debt of a deleted server's keys once, when the project opens", async () => {
    // Keys left owed by an app closed within the undo's thirty seconds are swept here.
    const asked = machine();
    const servers = [aServer()];
    const { rerender } = renderHook(() => useServers(DIRECTORY, servers));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    rerender();
    rerender();

    expect(asked.filter((one) => one.channel === SWEEP_MCP_KEYS_CHANNEL)).toHaveLength(1);
  });

  it("says nothing of a server the project never named", async () => {
    const asked = machine();
    const { result } = renderHook(() => useServers(DIRECTORY, []));

    act(() => result.current.look("a server nobody declared"));

    await waitFor(() => expect(result.current.askingSince).toEqual({}));
    expect(looks(asked)).toHaveLength(0);
  });

  it("holds no look for a server whose run line is not agreed to, so its row stays unknown", async () => {
    const invoke = vi.fn(async (channel: string, payload: unknown) => {
      if (channel !== LOOK_MCP_SERVER_CHANNEL) {
        return undefined;
      }

      return {
        serverId: (<{ server: ProjectMcpServer }>payload).server.id,
        isUp: false,
        functions: [],
        answeredAt: null,
        failure: "Error: MCP_CONSENT_MISSING",
        changedAt: null,
        wasCount: null,
        calls: NO_MCP_CALLS,
      };
    });

    standInBridge({
      invoke,
    });

    const { result } = renderHook(() => useServers(DIRECTORY, [aLocalServer()]));

    act(() => result.current.look(aLocalServer().id));

    await waitFor(() => expect(result.current.askingSince).toEqual({}));

    expect(invoke).toHaveBeenCalledWith(LOOK_MCP_SERVER_CHANNEL, expect.anything());
    expect(result.current.looks).toEqual({});
  });

  it("starts no local server as the project opens, and asks the remote one beside it", async () => {
    const asked = machine();
    const { result } = renderHook(() => useServers(DIRECTORY, [aLocalServer(), aServer()]));

    await waitFor(() => expect(Object.keys(result.current.looks)).toEqual([aServer().id]));

    expect(looks(asked).map((one) => (<{ server: ProjectMcpServer }>one.payload).server.id)).toEqual([aServer().id]);
    expect(result.current.looks[aLocalServer().id]).toBeUndefined();
  });

  it("leaves a local server nobody raised alone when its line changes in the file", async () => {
    const asked = machine();
    let servers = [aLocalServer()];
    const { rerender } = renderHook(() => useServers(DIRECTORY, servers));

    servers = [
      aLocalServer({
        run: "npx server-filesystem ~",
      }),
    ];
    rerender();

    await waitFor(() => expect(asked.length).toBeGreaterThan(0));
    expect(walk(asked)).toEqual([]);
  });

  it("asks a local server once a person raised it, and afresh when its line changes after that", async () => {
    const asked = machine();
    let servers = [aLocalServer()];
    const { result, rerender } = renderHook(() => useServers(DIRECTORY, servers));

    act(() => result.current.restart(aLocalServer().id));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    servers = [
      aLocalServer({
        run: "npx server-filesystem ~",
      }),
    ];
    rerender();

    await waitFor(() => expect(looks(asked)).toHaveLength(2));
    expect(walk(asked)).toEqual([
      CLOSE_MCP_SERVER_CHANNEL,
      LOOK_MCP_SERVER_CHANNEL,
      CLOSE_MCP_SERVER_CHANNEL,
      LOOK_MCP_SERVER_CHANNEL,
    ]);
  });

  it("«ЗУПИНИТИ» lets a standing server go and leaves its row unknown", async () => {
    const asked = machine();
    const { result } = renderHook(() => useServers(DIRECTORY, [aLocalServer()]));

    act(() => result.current.restart(aLocalServer().id));

    await waitFor(() => expect(result.current.looks[aLocalServer().id]?.isUp).toBe(true));

    act(() => result.current.stop(aLocalServer().id));

    expect(result.current.looks).toEqual({});
    expect(result.current.askingSince).toEqual({});
    expect(walk(asked).at(-1)).toBe(CLOSE_MCP_SERVER_CHANNEL);
  });

  it("starts nothing for a stopped server when its line then changes in the file", async () => {
    const asked = machine();
    let servers = [aLocalServer()];
    const { result, rerender } = renderHook(() => useServers(DIRECTORY, servers));

    act(() => result.current.restart(aLocalServer().id));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    act(() => result.current.stop(aLocalServer().id));

    servers = [
      aLocalServer({
        run: "npx server-filesystem ~",
      }),
    ];
    rerender();

    expect(looks(asked)).toHaveLength(1);
    expect(result.current.looks).toEqual({});
  });
});
