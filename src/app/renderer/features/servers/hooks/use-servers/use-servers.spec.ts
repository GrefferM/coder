import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useServers } from "./use-servers";
import { CLOSE_MCP_SERVER_CHANNEL, LOOK_MCP_SERVER_CHANNEL, SWEEP_MCP_KEYS_CHANNEL } from "../../../../../../contracts";
import { standInBridge } from "../../../../testing";
import type { ProjectMcpServer } from "../../../../interfaces";
import { NO_MCP_CALLS } from "../../../../interfaces";

const DIRECTORY = "/tmp/coder";

function aServer(patch: Partial<ProjectMcpServer> = {}): ProjectMcpServer {
  return {
    id: "99999999-9999-4999-8999-999999999999",
    name: "filesystem",
    isLocal: true,
    run: "npx server-filesystem .",
    address: "",
    signIn: "none",
    env: [],
    ...patch,
  };
}

/** A machine that answers every look for a server that is up, and remembers what it was asked. */
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

const looks = (asked: { channel: string }[]) => asked.filter((one) => one.channel === LOOK_MCP_SERVER_CHANNEL);
/**
 * The walk to and from one server, and nothing else that goes down the same wire. The sweep of a deleted
 * server's keys rides here too and is somebody else's errand: it says nothing about how a server is asked.
 */
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

    // The wait is for the answers, not for the asks: the second look is sent long before it comes back.
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

    // The order is the whole of it: asking a fallen server again without letting it go asks the same dead process.
    expect(walk(asked)).toEqual([LOOK_MCP_SERVER_CHANNEL, CLOSE_MCP_SERVER_CHANNEL, LOOK_MCP_SERVER_CHANNEL]);
  });

  it("lets a redeclared server go and asks it afresh, dropping what the old one said", async () => {
    // The id stays and everything behind it changed: a process started from the old line is not this server,
    // and the old way in's refusal would stand over the new one until somebody thought to restart it by hand.
    const asked = machine();
    let servers = [aServer()];
    const { rerender } = renderHook(() => useServers(DIRECTORY, servers));

    await waitFor(() => expect(looks(asked)).toHaveLength(1));

    servers = [
      aServer({
        isLocal: false,
        run: "",
        address: "https://mcp.linear.app/sse",
      }),
    ];
    rerender();

    await waitFor(() => expect(looks(asked)).toHaveLength(2));
    expect(walk(asked)).toEqual([LOOK_MCP_SERVER_CHANNEL, CLOSE_MCP_SERVER_CHANNEL, LOOK_MCP_SERVER_CHANNEL]);
  });

  it("leaves a server alone when only its name changed", async () => {
    // A name is nobody's way in: renaming must not stop a running server and start it over.
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
    // An ask cannot be called back once it is out, so the answer to it is dropped when it arrives —
    // otherwise a row somebody let go of lights up by itself half a minute later.
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
    // An app closed inside the undo's thirty seconds left the keys owed; this is where they go.
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
});
