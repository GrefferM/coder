import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKnownProjects } from "./use-known-projects";
import { PROJECT_NOT_FOUND } from "../../constants";
import {
  CHOOSE_DIRECTORY_CHANNEL,
  FORGET_PROJECT_CHANNEL,
  LIST_RECENT_PROJECTS_CHANNEL,
  OPEN_OR_CREATE_PROJECT_CHANNEL,
  OPEN_PROJECT_CHANNEL,
  REVEAL_PROJECT_CHANNEL,
} from "../../../../../../contracts";
import { aConfig, standInBridge } from "../../../../testing";
import type { OpenProject, ProjectEntry } from "../../../../interfaces";

const PROJECT: OpenProject = {
  directory: "/tmp/coder",
  config: aConfig(),
  print: "print-1",
  view: null,
};

function entry(directory: string, patch: Partial<ProjectEntry> = {}): ProjectEntry {
  return {
    id: `entry-${directory}`,
    name: "Coder",
    directory,
    openedAt: "2026-09-01T10:00:00.000Z",
    exists: true,
    agentCount: 3,
    ...patch,
  };
}

/** The machine answers each channel with what the spec supplies; a failing channel throws its reason. */
function machine(answers: Record<string, unknown> = {}, failing: Record<string, string> = {}) {
  const sent: { channel: string; payload: unknown }[] = [];
  const invoke = vi.fn(async (channel: string, payload?: unknown) => {
    sent.push({
      channel,
      payload,
    });

    if (channel in failing) {
      throw new Error(failing[channel]);
    }

    return answers[channel];
  });

  standInBridge({
    invoke,
  });

  return {
    sent,
    of: (channel: string) => sent.filter((one) => one.channel === channel),
  };
}

function switcher(isOpen = true) {
  const onProjectChange = vi.fn();
  const onDone = vi.fn();
  const rendered = renderHook(() => useKnownProjects(PROJECT, isOpen, onProjectChange, onDone));

  return {
    ...rendered,
    onProjectChange,
    onDone,
  };
}

describe("useKnownProjects · the list", () => {
  it("reads the machine's own list while the switcher stands open", async () => {
    machine({
      [LIST_RECENT_PROJECTS_CHANNEL]: [entry("/tmp/coder"), entry("/tmp/other")],
    });

    const { result } = switcher();

    await waitFor(() => expect(result.current.known).toHaveLength(2));
  });

  it("does not read anything while the switcher is shut", () => {
    const held = machine({
      [LIST_RECENT_PROJECTS_CHANNEL]: [entry("/tmp/coder")],
    });

    switcher(false);

    expect(held.of(LIST_RECENT_PROJECTS_CHANNEL)).toHaveLength(0);
  });

  it("says in words that the list could not be read, instead of standing empty and silent", async () => {
    machine(
      {},
      {
        [LIST_RECENT_PROJECTS_CHANNEL]: "немає бази",
      },
    );

    const { result } = switcher();

    await waitFor(() => expect(result.current.error).toContain("немає бази"));
  });
});

describe("useKnownProjects · what it does over the list", () => {
  it("opens a project and shuts the list behind it", async () => {
    const held = machine({
      [LIST_RECENT_PROJECTS_CHANNEL]: [entry("/tmp/other")],
      [OPEN_PROJECT_CHANNEL]: {
        config: aConfig(),
        print: "print-1",
      },
    });
    const { result, onProjectChange, onDone } = switcher();

    await act(() => result.current.switchTo("/tmp/other"));

    expect(held.of(OPEN_PROJECT_CHANNEL)[0].payload).toEqual({
      directory: "/tmp/other",
    });
    expect(onProjectChange).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });

  it("marks the row of a folder that is gone from the disk, rather than saying nothing", async () => {
    machine(
      {
        [LIST_RECENT_PROJECTS_CHANNEL]: [entry("/tmp/coder"), entry("/tmp/gone")],
      },
      {
        [OPEN_PROJECT_CHANNEL]: PROJECT_NOT_FOUND,
      },
    );

    const { result, onProjectChange } = switcher();

    await waitFor(() => expect(result.current.known).toHaveLength(2));
    await act(() => result.current.switchTo("/tmp/gone"));

    expect(result.current.known.find((one) => one.directory === "/tmp/gone")?.exists).toBe(false);
    expect(result.current.known.find((one) => one.directory === "/tmp/coder")?.exists).toBe(true);
    // The list stays open on a row that could not be opened.
    expect(onProjectChange).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it("says any other failure of opening in words, and stays where it is", async () => {
    machine(
      {
        [LIST_RECENT_PROJECTS_CHANNEL]: [entry("/tmp/other")],
      },
      {
        [OPEN_PROJECT_CHANNEL]: "диск лише для читання",
      },
    );

    const { result, onProjectChange } = switcher();

    await act(() => result.current.switchTo("/tmp/other"));

    expect(result.current.error).toContain("диск лише для читання");
    expect(onProjectChange).not.toHaveBeenCalled();
  });

  it("takes a chosen folder as a project, whether one is already there or not", async () => {
    // Opening a folder and starting a project are one act: a folder without a project gets one.
    const held = machine({
      [LIST_RECENT_PROJECTS_CHANNEL]: [],
      [CHOOSE_DIRECTORY_CHANNEL]: "/tmp/chosen",
      [OPEN_OR_CREATE_PROJECT_CHANNEL]: {
        config: aConfig(),
        print: "print-1",
      },
    });
    const { result, onProjectChange, onDone } = switcher();

    await act(() => result.current.chooseFolder());

    expect(held.of(OPEN_OR_CREATE_PROJECT_CHANNEL)[0].payload).toMatchObject({
      directory: "/tmp/chosen",
    });
    expect(onProjectChange).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });

  it("does nothing at all when no folder was chosen", async () => {
    const held = machine({
      [LIST_RECENT_PROJECTS_CHANNEL]: [],
      [CHOOSE_DIRECTORY_CHANNEL]: null,
    });
    const { result, onProjectChange } = switcher();

    await act(() => result.current.chooseFolder());

    expect(held.of(OPEN_OR_CREATE_PROJECT_CHANNEL)).toHaveLength(0);
    expect(onProjectChange).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it("drops a forgotten project out of the list without reading the machine again", async () => {
    const held = machine({
      [LIST_RECENT_PROJECTS_CHANNEL]: [entry("/tmp/coder"), entry("/tmp/other")],
    });
    const { result } = switcher();

    await waitFor(() => expect(result.current.known).toHaveLength(2));
    await act(() => result.current.forget("/tmp/other"));

    expect(result.current.known.map((one) => one.directory)).toEqual(["/tmp/coder"]);
    expect(held.of(LIST_RECENT_PROJECTS_CHANNEL)).toHaveLength(1);
  });

  it("keeps the row when the machine would not forget it, and says why", async () => {
    machine(
      {
        [LIST_RECENT_PROJECTS_CHANNEL]: [entry("/tmp/other")],
      },
      {
        [FORGET_PROJECT_CHANNEL]: "база зайнята",
      },
    );

    const { result } = switcher();

    await waitFor(() => expect(result.current.known).toHaveLength(1));
    await act(() => result.current.forget("/tmp/other"));

    expect(result.current.known).toHaveLength(1);
    expect(result.current.error).toContain("база зайнята");
  });

  it("shows the open project's own folder to the system", async () => {
    const held = machine({
      [LIST_RECENT_PROJECTS_CHANNEL]: [],
    });
    const { result, onDone } = switcher();

    await act(() => result.current.reveal());

    expect(held.of(REVEAL_PROJECT_CHANNEL)[0].payload).toBe("/tmp/coder");
    expect(onDone).toHaveBeenCalled();
  });
});
