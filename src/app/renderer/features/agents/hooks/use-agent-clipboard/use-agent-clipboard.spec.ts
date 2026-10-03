import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAgentClipboard } from "./use-agent-clipboard";
import { aConfig, anAgent } from "../../../../testing";
import type { AgentWrites } from "../use-agent-writes";
import type { OpenProject } from "../../../../interfaces";

const SEEKER = anAgent({
  id: "agent-1",
  name: "Шукач",
  x: 300,
  y: 200,
});

const PROJECT: OpenProject = {
  directory: "/tmp/coder",
  config: aConfig({
    agents: [SEEKER],
  }),
  print: "print-1",
  view: null,
};

function clipboard(
  project: OpenProject = PROJECT,
  pasted: unknown = {
    agentId: "agent-copy",
    sourceAgentId: "agent-1",
  },
) {
  const pasteAgent = vi.fn(async () => pasted);
  const writes = <AgentWrites>(<unknown>{
    pasteAgent,
  });
  const rendered = renderHook(() => useAgentClipboard(project, writes));

  return {
    ...rendered,
    pasteAgent,
  };
}

describe("useAgentClipboard", () => {
  it("offers nothing until an agent is taken", () => {
    expect(clipboard().result.current.isPasteOffered).toBe(false);
  });

  it("offers the copy while the project still holds the agent it was taken from", () => {
    const { result } = clipboard();

    act(() => result.current.copy("agent-1"));

    expect(result.current.isPasteOffered).toBe(true);
  });

  it("offers no copy of an agent the project has let go since", () => {
    // A copy of an agent deleted since is not offered.
    const { result } = clipboard();

    act(() => result.current.copy("agent-gone"));

    expect(result.current.isPasteOffered).toBe(false);
  });

  it("puts the copy on the first free place beside the original, never over it", () => {
    // The copy steps down and to the right of its original.
    const { result, pasteAgent } = clipboard();

    act(() => result.current.copy("agent-1"));
    act(() => {
      void result.current.pasteBesideSource();
    });

    expect(pasteAgent).toHaveBeenCalledWith("agent-1", {
      x: 430,
      y: 330,
    });
  });

  it("marks the copy it put down, and takes the mark off when asked", async () => {
    const { result } = clipboard();

    act(() => result.current.copy("agent-1"));
    await act(async () => {
      await result.current.pasteBesideSource();
    });

    expect(result.current.pasted).toMatchObject({
      agentId: "agent-copy",
    });

    act(() => result.current.dismissPasted());

    expect(result.current.pasted).toBeNull();
  });

  it("puts nothing down with an empty hand", async () => {
    const { result, pasteAgent } = clipboard();
    let put: string | null = "not asked";

    await act(async () => {
      put = await result.current.pasteBesideSource();
    });

    expect(put).toBeNull();
    expect(pasteAgent).not.toHaveBeenCalled();
  });

  it("marks nothing when the write refused the copy", async () => {
    // A refused write leaves no pasted mark and keeps the original held.
    const { result } = clipboard(PROJECT, null);

    act(() => result.current.copy("agent-1"));
    await act(async () => {
      await result.current.pasteBesideSource();
    });

    expect(result.current.pasted).toBeNull();
    expect(result.current.isPasteOffered).toBe(true);
  });
});
