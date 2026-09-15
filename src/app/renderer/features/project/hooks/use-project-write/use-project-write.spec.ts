import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useProjectWrite } from "./use-project-write";
import { WRITE_FAILED_PREFIX } from "../../constants";
import { FORGET_DELETION_CHANNEL, REMEMBER_DELETION_CHANNEL, SAVE_PROJECT_CHANNEL } from "../../../../../../contracts";
import { aConfig, anAgent, standInBridge } from "../../../../testing";
import type { OpenProject, ProjectConfig } from "../../../../interfaces";

const SEEKER = anAgent({
  id: "agent-1",
  name: "Шукач",
});
const TELLER = anAgent({
  id: "agent-2",
  name: "Тезар",
});

const CONFIG = aConfig({
  agents: [SEEKER, TELLER],
});

const PROJECT: OpenProject = {
  directory: "/tmp/coder",
  config: CONFIG,
  view: null,
};

/** The machine as the writes meet it: every channel answers, and a spec can make one of them refuse. */
function machine(failing: string[] = []) {
  const sent: { channel: string; payload: unknown }[] = [];
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    sent.push({
      channel,
      payload,
    });

    if (failing.includes(channel)) {
      throw new Error("немає теки");
    }

    return channel === REMEMBER_DELETION_CHANNEL ? "deletion-1" : undefined;
  });

  standInBridge({
    invoke,
  });

  return {
    sent,
    invoke,
    of: (channel: string) => sent.filter((one) => one.channel === channel),
  };
}

/** The page holding the open project, so a spec can see what the hook put into it. */
function writing(config: ProjectConfig = CONFIG) {
  let standing: OpenProject | null = {
    ...PROJECT,
    config,
  };
  const setProject = vi.fn((change: unknown) => {
    standing =
      typeof change === "function" ? (<(open: OpenProject | null) => OpenProject | null>change)(standing) : null;
  });
  const rendered = renderHook(() => useProjectWrite(<OpenProject>standing, setProject));

  return {
    ...rendered,
    page: () => standing,
  };
}

/** The same project without its second agent — what a deletion leaves behind. */
const WITHOUT_TELLER = aConfig({
  agents: [SEEKER],
});

describe("useProjectWrite · one write", () => {
  it("writes the whole config into the project's folder and says what it did", async () => {
    const held = machine();
    const { result, page } = writing();

    await act(() => result.current.save(WITHOUT_TELLER, "Агента збережено"));

    expect(held.of(SAVE_PROJECT_CHANNEL)[0].payload).toEqual({
      directory: "/tmp/coder",
      config: WITHOUT_TELLER,
    });
    expect(page()?.config).toEqual(WITHOUT_TELLER);
    expect(result.current.writeNote).toEqual({
      label: "Агента збережено",
      detail: null,
      reason: null,
    });
  });

  it("says nothing about a write asked to be quiet", async () => {
    machine();

    const { result } = writing();

    await act(() => result.current.save(WITHOUT_TELLER, "Агента забрано", true));

    expect(result.current.writeNote).toBeNull();
  });

  it("keeps the project as it was when the write did not go through, and says why", async () => {
    // The file refused, so the screen must not show what the file does not hold.
    machine([SAVE_PROJECT_CHANNEL]);

    const { result, page } = writing();

    await act(async () => {
      await expect(result.current.save(WITHOUT_TELLER, "Агента збережено")).rejects.toThrow();
    });

    expect(page()?.config).toEqual(CONFIG);
    expect(result.current.writeNote?.reason).toContain(WRITE_FAILED_PREFIX);
  });

  it("runs the very write that failed when «ще раз» is pressed", async () => {
    // The same config and the same word, not whatever the screen holds by then.
    const held = machine([SAVE_PROJECT_CHANNEL]);
    const { result } = writing();

    await act(async () => {
      await expect(result.current.save(WITHOUT_TELLER, "Агента збережено")).rejects.toThrow();
    });
    await act(() => result.current.retryWrite());

    expect(held.of(SAVE_PROJECT_CHANNEL)).toHaveLength(2);
    expect(held.of(SAVE_PROJECT_CHANNEL)[1].payload).toEqual({
      directory: "/tmp/coder",
      config: WITHOUT_TELLER,
    });
  });

  it("says a word that came from outside on the same line a write speaks on", async () => {
    machine();

    const { result } = writing();

    act(() =>
      result.current.sayNote({
        label: "Файл змінився ззовні",
        detail: null,
        reason: null,
      }),
    );

    expect(result.current.writeNote?.label).toBe("Файл змінився ззовні");

    act(() => result.current.dismissWriteNote());

    expect(result.current.writeNote).toBeNull();
  });
});

describe("useProjectWrite · a deletion and its way back", () => {
  it("takes the thing out at once, writes it down, and stands a way back", async () => {
    // The sphere goes the moment the hand says so; the offer is what makes that safe.
    const held = machine();
    const { result, page } = writing();

    await act(() =>
      result.current.defer(WITHOUT_TELLER, "agent", "Тезар", "Агента забрано", {
        x: 100,
        y: 120,
      }),
    );

    expect(page()?.config).toEqual(WITHOUT_TELLER);
    expect(held.of(REMEMBER_DELETION_CHANNEL)[0].payload).toMatchObject({
      directory: "/tmp/coder",
      kind: "agent",
      name: "Тезар",
    });
    expect(result.current.undoOffers).toHaveLength(1);
    expect(result.current.undoOffers[0].message).toBe("Агента забрано");
    // The write is quiet: the way back is the word about this deletion, and two words would say it twice.
    expect(result.current.writeNote).toBeNull();
  });

  it("puts the thing back and offers nothing when the file refused the deletion", async () => {
    const held = machine([SAVE_PROJECT_CHANNEL]);
    const { result, page } = writing();

    await act(() => result.current.defer(WITHOUT_TELLER, "agent", "Тезар", "Агента забрано", null));

    expect(page()?.config.agents.map((agent) => agent.id)).toEqual(["agent-1", "agent-2"]);
    expect(result.current.undoOffers).toEqual([]);
    expect(held.of(REMEMBER_DELETION_CHANNEL)).toHaveLength(0);
  });

  it("stands the way back even when the history could not remember the deletion", async () => {
    // The thing is gone from the file either way; without an offer the person would have no way back at all.
    machine([REMEMBER_DELETION_CHANNEL]);

    const { result } = writing();

    await act(() => result.current.defer(WITHOUT_TELLER, "agent", "Тезар", "Агента забрано", null));

    expect(result.current.undoOffers).toHaveLength(1);
    expect(result.current.undoOffers[0].deletionId).toBeNull();
  });

  it("brings the thing back, lets its history row go, and takes the offer down", async () => {
    const held = machine();
    const { result, page } = writing();

    await act(() => result.current.defer(WITHOUT_TELLER, "agent", "Тезар", "Агента забрано", null));
    await act(() => result.current.undoOffer(result.current.undoOffers[0].id));

    expect(page()?.config.agents.map((agent) => agent.id)).toEqual(["agent-1", "agent-2"]);
    expect(held.of(FORGET_DELETION_CHANNEL)[0].payload).toEqual({
      id: "deletion-1",
    });
    expect(result.current.undoOffers).toEqual([]);
  });

  it("answers ⌘Z with the newest way back and leaves the older ones standing", async () => {
    // ⌘Z is the bottom row's; the rows above it keep their own buttons.
    machine();

    const { result } = writing();

    await act(() => result.current.defer(WITHOUT_TELLER, "agent", "Тезар", "Перше", null));
    await act(() => result.current.defer(WITHOUT_TELLER, "agent", "Шукач", "Друге", null));
    await act(() => result.current.undoDelete());

    expect(result.current.undoOffers.map((offer) => offer.message)).toEqual(["Перше"]);
  });

  it("does nothing on ⌘Z with no way back standing", async () => {
    const held = machine();
    const { result } = writing();

    await act(() => result.current.undoDelete());

    expect(held.sent).toEqual([]);
  });

  it("takes the offer down when the same deletion is put back from the history instead", async () => {
    // Two doors to one deletion: the history's row and the offer over the canvas, and it goes back once.
    const held = machine();
    const { result } = writing();

    await act(() => result.current.defer(WITHOUT_TELLER, "agent", "Тезар", "Агента забрано", null));
    await act(() =>
      result.current.restoreDeletion("deletion-1", {
        models: [],
        prompts: [],
        commands: [],
        servers: [],
        agents: [TELLER],
        links: [],
        promptTakenFrom: [],
        grantsTakenFrom: [],
      }),
    );

    expect(held.of(FORGET_DELETION_CHANNEL)).toHaveLength(1);
    expect(result.current.undoOffers).toEqual([]);
  });
});
