import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProjectActions } from "./use-project-actions";
import { UNDO_STANDS_MS, DELETED_PLACE_MS } from "../../../../features/project/constants";
import { MS_IN_SECOND } from "../../../../utils/dates/constants";
import { FORGET_DELETION_CHANNEL, REMEMBER_DELETION_CHANNEL } from "../../../../../../contracts";
import { SAVE_PROJECT_CHANNEL } from "../../../../../../contracts";
import { DELETED_LINK_LABEL } from "../../../../features/links/constants";
import { deletedModelLabel } from "../../../../features/models";
import type { OpenProject } from "../../../../interfaces";
import type { TakenThings } from "../../../../features/project/interfaces";
import { aConfig, aLink, aModel, anAgent, standInBridge } from "../../../../testing";

const PROJECT: OpenProject = {
  directory: "/tmp/project",
  config: aConfig({
    agents: [
      anAgent({
        name: "EDITOR",
        color: "#b18aff",
        x: 10,
        y: 20,
        maxCalls: 5,
        temperature: 0.3,
      }),
    ],
  }),
  view: null,
};

/** The project with a model and a link from its one agent. */
const WITH_LINK: OpenProject = {
  ...PROJECT,
  config: {
    ...PROJECT.config,
    models: [
      aModel({
        title: "claude-sonnet-4.5",
        provider: "anthropic",
        contextCeiling: 200000,
      }),
    ],
    links: [
      aLink({
        to: "agent-1",
      }),
    ],
  },
};

function held() {
  const invoke = vi.fn(async (channel: string, _payload?: unknown) =>
    channel === REMEMBER_DELETION_CHANNEL ? "deletion-1" : undefined,
  );

  standInBridge({
    invoke: invoke,
  });

  return invoke;
}

describe("useProjectActions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes a deletion and remembers it at once, and still leaves the way back standing", async () => {
    const invoke = held();
    const setProject = vi.fn();
    const { result } = renderHook(() => useProjectActions(PROJECT, setProject));

    await act(async () => {
      await result.current.deleteAgent("agent-1");
    });

    // Deletion is applied to the screen, the folder and the history at once.
    expect(setProject).toHaveBeenCalled();
    expect(invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
      directory: PROJECT.directory,
      config: expect.objectContaining({
        agents: [],
      }),
    });
    expect(invoke).toHaveBeenCalledWith(
      REMEMBER_DELETION_CHANNEL,
      expect.objectContaining({
        kind: "agent",
      }),
    );
    expect(result.current.undoOffers).toHaveLength(1);
  });

  it("puts the thing back and lets its history row go, so one deletion cannot come back twice", async () => {
    const invoke = held();
    const { result } = renderHook(() => useProjectActions(PROJECT, vi.fn()));

    await act(async () => {
      await result.current.deleteAgent("agent-1");
    });
    await act(async () => {
      await result.current.undoDelete();
    });

    expect(invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
      directory: PROJECT.directory,
      config: expect.objectContaining({
        agents: [PROJECT.config.agents[0]],
      }),
    });
    expect(invoke).toHaveBeenCalledWith(FORGET_DELETION_CHANNEL, {
      id: "deletion-1",
    });
    expect(result.current.undoOffers).toHaveLength(0);
  });

  it("holds the way back through another write, and stands the next deletion over it", async () => {
    const invoke = held();
    const { result } = renderHook(() => useProjectActions(WITH_LINK, vi.fn()));

    await act(async () => {
      await result.current.deleteLink("link-1");
    });

    expect(result.current.undoOffers.at(-1)?.message).toBe(DELETED_LINK_LABEL);

    await act(async () => {
      await result.current.saveAgent("agent-1", {
        name: "REVIEWER",
      });
    });

    // A write is not an answer to the question the line asks.
    expect(result.current.undoOffers.at(-1)?.message).toBe(DELETED_LINK_LABEL);

    await act(async () => {
      await result.current.deleteModel("model-1");
    });

    // A second deletion stacks on the first; each keeps its own thirty seconds.
    expect(result.current.undoOffers.map((offer) => offer.message)).toEqual([
      DELETED_LINK_LABEL,
      deletedModelLabel(1, 1),
    ]);
    expect(invoke).toHaveBeenCalledWith(
      REMEMBER_DELETION_CHANNEL,
      expect.objectContaining({
        kind: "model",
      }),
    );
  });

  it("puts the trace out after a second and a half, while the line stands its thirty", async () => {
    held();
    const { result } = renderHook(() => useProjectActions(PROJECT, vi.fn()));

    await act(async () => {
      await result.current.deleteAgent("agent-1");
    });

    expect(result.current.undoOffers.at(-1)?.place).not.toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELETED_PLACE_MS);
    });

    // The offer's `place` is `null`: the text may wait.
    expect(result.current.undoOffers.at(-1)?.place).toBeNull();
    expect(result.current.undoOffers).toHaveLength(1);
  });

  it("takes the way back down after thirty seconds, and writes nothing more when it goes", async () => {
    const invoke = held();
    const { result } = renderHook(() => useProjectActions(PROJECT, vi.fn()));

    await act(async () => {
      await result.current.deleteAgent("agent-1");
    });

    const written = invoke.mock.calls.length;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(UNDO_STANDS_MS);
    });

    expect(result.current.undoOffers).toHaveLength(0);
    expect(invoke).toHaveBeenCalledTimes(written);
  });

  it("says what a deletion took when it writes it down, and takes the chain with it", async () => {
    const invoke = held();
    const { result } = renderHook(() => useProjectActions(WITH_LINK, vi.fn()));

    await act(async () => {
      await result.current.deleteModel("model-1");
    });

    // Model, agent and link go into one history row.
    expect(invoke).toHaveBeenCalledWith(REMEMBER_DELETION_CHANNEL, {
      directory: WITH_LINK.directory,
      kind: "model",
      name: "claude-sonnet-4.5",
      taken: expect.objectContaining({
        models: [WITH_LINK.config.models[0]],
        agents: [WITH_LINK.config.agents[0]],
        links: WITH_LINK.config.links,
      }),
    });
  });

  it("takes the offer down when the same deletion is put back from the history instead", async () => {
    const invoke = held();
    const { result } = renderHook(() => useProjectActions(PROJECT, vi.fn()));

    await act(async () => {
      await result.current.deleteAgent("agent-1");
    });

    const remembered = invoke.mock.calls.find(([channel]) => channel === REMEMBER_DELETION_CHANNEL);
    const { taken } = <{ taken: TakenThings }>remembered?.[1];

    await act(async () => {
      await result.current.restoreDeletion("deletion-1", taken);
    });

    // No undo offer: the agent is already in place.
    expect(result.current.undoOffers).toHaveLength(0);
    expect(invoke).toHaveBeenCalledWith(FORGET_DELETION_CHANNEL, {
      id: "deletion-1",
    });
  });

  it("leaves the thing on the screen when the folder refuses the write, and remembers nothing", async () => {
    const invoke = held();
    const setProject = vi.fn();

    invoke.mockRejectedValueOnce(new Error("тека тільки для читання"));

    const { result } = renderHook(() => useProjectActions(PROJECT, setProject));

    await act(async () => {
      await result.current.deleteAgent("agent-1");
    });

    expect(invoke).not.toHaveBeenCalledWith(REMEMBER_DELETION_CHANNEL, expect.anything());
    expect(result.current.undoOffers).toHaveLength(0);
    // Removed immediately, restored when the folder refuses.
    expect(setProject).toHaveBeenCalledTimes(2);
  });

  it("takes the newest offer by keyboard, and leaves the older one standing", async () => {
    held();
    const { result } = renderHook(() => useProjectActions(WITH_LINK, vi.fn()));

    await act(async () => {
      await result.current.deleteLink("link-1");
    });
    await act(async () => {
      await result.current.deleteModel("model-1");
    });
    await act(async () => {
      await result.current.undoDelete();
    });

    // ⌘Z answers the bottom row, not the whole stack.
    expect(result.current.undoOffers.map((offer) => offer.message)).toEqual([DELETED_LINK_LABEL]);
  });

  it("takes an older offer by its own way back, and leaves the newest standing", async () => {
    held();
    const { result } = renderHook(() => useProjectActions(WITH_LINK, vi.fn()));

    await act(async () => {
      await result.current.deleteLink("link-1");
    });
    await act(async () => {
      await result.current.deleteModel("model-1");
    });

    const [older] = result.current.undoOffers;

    await act(async () => {
      await result.current.undoOffer(older.id);
    });

    expect(result.current.undoOffers.map((offer) => offer.message)).toEqual([deletedModelLabel(1, 1)]);
  });

  it("counts each offer's own seconds down", async () => {
    held();
    const { result } = renderHook(() => useProjectActions(PROJECT, vi.fn()));

    await act(async () => {
      await result.current.deleteAgent("agent-1");
    });

    expect(result.current.undoOffers[0].secondsLeft).toBe(UNDO_STANDS_MS / MS_IN_SECOND);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3 * MS_IN_SECOND);
    });

    // «27 С» three seconds in.
    expect(result.current.undoOffers[0].secondsLeft).toBe(27);
  });
});
