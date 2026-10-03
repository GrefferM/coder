import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useProjectWrite } from "./use-project-write";
import { PROJECT_CHANGED_ON_DISK, PROJECT_CHANGED_ON_DISK_NOTE, WRITE_FAILED_PREFIX } from "../../constants";
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
  print: "print-1",
  view: null,
};

/** The machine as the writes meet it: every channel answers, and a spec can make one refuse. */
function machine(failing: string[] = [], failure = "немає теки") {
  const sent: { channel: string; payload: unknown }[] = [];
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    sent.push({
      channel,
      payload,
    });

    if (failing.includes(channel)) {
      throw new Error(failure);
    }

    if (channel === SAVE_PROJECT_CHANNEL) {
      return "print-2";
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

/** The page holding the open project, so a spec can see what the hook put in it. */
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

/** The project without its second agent: what a deletion leaves. */
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
      // The reading the config was made from, so a folder changed since is not written over.
      basis: "print-1",
    });
    expect(page()?.config).toEqual(WITHOUT_TELLER);
    // The next save stands on what this one left.
    expect(page()?.print).toBe("print-2");
    expect(result.current.writeNote).toEqual({
      label: "Агента збережено",
      detail: null,
      reason: null,
      isRefusal: false,
    });
  });

  it("says nothing about a write asked to be quiet", async () => {
    machine();

    const { result } = writing();

    await act(() => result.current.save(WITHOUT_TELLER, "Агента забрано", true));

    expect(result.current.writeNote).toBeNull();
  });

  it("keeps the project as it was when the write did not go through, and says why", async () => {
    // The file refused, so the screen must not show what the file lacks.
    machine([SAVE_PROJECT_CHANNEL]);

    const { result, page } = writing();

    await act(async () => {
      await expect(result.current.save(WITHOUT_TELLER, "Агента збережено")).rejects.toThrow();
    });

    expect(page()?.config).toEqual(CONFIG);
    expect(result.current.writeNote?.reason).toContain(WRITE_FAILED_PREFIX);
  });

  it("says in red that nothing was written where the files changed on disk, and offers no «ще раз»", async () => {
    // The same save again would only undo the change on disk; the folder is read again instead.
    machine([SAVE_PROJECT_CHANNEL], `Error invoking remote method 'projects:save': Error: ${PROJECT_CHANGED_ON_DISK}`);

    const { result, page } = writing();

    await act(async () => {
      await expect(result.current.save(WITHOUT_TELLER, undefined, true)).rejects.toThrow();
    });

    expect(page()?.config).toEqual(CONFIG);
    expect(result.current.writeNote).toEqual({
      label: PROJECT_CHANGED_ON_DISK_NOTE,
      detail: null,
      reason: PROJECT_CHANGED_ON_DISK_NOTE,
      isRefusal: true,
    });
  });

  it("runs the very write that failed when «ще раз» is pressed", async () => {
    // The same config and word, not whatever the screen holds by then.
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
      basis: "print-1",
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
        isRefusal: false,
      }),
    );

    expect(result.current.writeNote?.label).toBe("Файл змінився ззовні");

    act(() => result.current.dismissWriteNote());

    expect(result.current.writeNote).toBeNull();
  });
});

describe("useProjectWrite · a deletion and its way back", () => {
  it("takes the thing out at once, writes it down, and stands a way back", async () => {
    // The sphere goes at once; the undo offer makes that safe.
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
    // The write is quiet: the deletion's own word is the way back, so no second word.
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
    // The thing is gone from the file either way; without an offer there would be no way back.
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
    // ⌘Z belongs to the bottom row; upper rows keep their own buttons.
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
    // Two doors to one deletion, the history row and the canvas offer; it is undone once.
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
