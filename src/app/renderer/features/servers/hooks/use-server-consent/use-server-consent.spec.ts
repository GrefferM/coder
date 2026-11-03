import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useServerConsent } from "./use-server-consent";
import { MCP_CONSENTED_CHANNEL, MCP_CONSENT_CHANNEL } from "../../../../../../contracts";
import { standInBridge } from "../../../../testing";
import type { ProjectMcpServer } from "../../../../interfaces";

const SERVER: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "exa-mcp",
  isLocal: true,
  run: "npx -y exa-mcp-server",
  address: "",
  signIn: "none",
  env: ["EXA_API_KEY"],
};

/** A machine that holds consent or not, and records every channel it is asked over. */
function machine(isGiven: boolean) {
  const asked: { channel: string; payload: unknown }[] = [];

  standInBridge({
    invoke: vi.fn(async (channel: string, payload: unknown) => {
      asked.push({
        channel,
        payload,
      });

      return channel === MCP_CONSENTED_CHANNEL ? isGiven : undefined;
    }),
  });

  return asked;
}

describe("useServerConsent", () => {
  it("raises a server whose line this machine agreed to, and opens no window", async () => {
    machine(true);
    const restart = vi.fn();
    const { result } = renderHook(() => useServerConsent([SERVER], restart));

    act(() => result.current.raise(SERVER.id));

    await waitFor(() => expect(restart).toHaveBeenCalledWith(SERVER.id));
    expect(result.current.asked).toBeNull();
  });

  it("opens the window over a line not agreed to, and starts nothing", async () => {
    const asked = machine(false);
    const restart = vi.fn();
    const { result } = renderHook(() => useServerConsent([SERVER], restart));

    act(() => result.current.raise(SERVER.id));

    await waitFor(() => expect(result.current.asked?.id).toBe(SERVER.id));
    expect(restart).not.toHaveBeenCalled();
    expect(asked.map((one) => one.channel)).toEqual([MCP_CONSENTED_CHANNEL]);
  });

  it("«Запустити» agrees to the line the window shows, then raises the server", async () => {
    const asked = machine(false);
    const restart = vi.fn();
    const { result } = renderHook(() => useServerConsent([SERVER], restart));

    act(() => result.current.ask(SERVER.id));

    await act(async () => {
      await result.current.agree();
    });

    expect(asked.find((one) => one.channel === MCP_CONSENT_CHANNEL)?.payload).toEqual({
      server: SERVER,
    });
    expect(restart).toHaveBeenCalledWith(SERVER.id);
    expect(result.current.asked).toBeNull();
  });

  it("«Не запускати» closes the window and changes nothing", () => {
    const asked = machine(false);
    const restart = vi.fn();
    const { result } = renderHook(() => useServerConsent([SERVER], restart));

    act(() => result.current.ask(SERVER.id));
    act(() => result.current.decline());

    expect(result.current.asked).toBeNull();
    expect(restart).not.toHaveBeenCalled();
    expect(asked).toEqual([]);
  });

  it("raises nothing for a server the project does not name", () => {
    const asked = machine(true);
    const restart = vi.fn();
    const { result } = renderHook(() => useServerConsent([SERVER], restart));

    act(() => result.current.raise("a server nobody declared"));

    expect(asked).toEqual([]);
    expect(restart).not.toHaveBeenCalled();
  });
});
