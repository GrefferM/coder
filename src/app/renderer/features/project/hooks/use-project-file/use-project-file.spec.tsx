import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { OPEN_PROJECT_CHANNEL, PROJECT_CHANGED_CHANNEL } from "../../../../../../contracts";
import { PROJECT_REREAD_LABEL } from "./constants";
import { useProjectFile } from "./use-project-file";
import type { ProjectChanged } from "../../../../../../contracts";
import type { OpenProject, ProjectConfig, UnsavedWork } from "../../../../interfaces";
import type { WriteNote } from "../../interfaces";
import { standInBridge } from "../../../../testing";
import { aConfig } from "../../../../testing";

const CONFIG: ProjectConfig = aConfig({});

const PROJECT: OpenProject = {
  directory: "/tmp/coder",
  config: CONFIG,
  view: null,
};

/** The one listener the hook puts on the channel, kept so a test can be the main process. */
let tell: (changed: { directory: string }) => void;

const DRAFT: UnsavedWork = {
  name: "EDITOR",
  changes: [],
  blocked: [],
  blockedNote: null,
  save: async () => {},
  discard: () => {},
};

/** The hook renders nothing; what it holds is shown through the probe's own line. */
function Probe({ isDirty, sayNote }: { isDirty: boolean; sayNote: (note: WriteNote) => void }) {
  const { arrived } = useProjectFile(PROJECT, () => {}, isDirty ? DRAFT : null, sayNote);

  return <span>{arrived === null ? "нічого не тримає" : "тримає те, що прийшло"}</span>;
}

describe("useProjectFile", () => {
  let invoke: Mock<(channel: string, payload?: unknown) => unknown>;

  beforeEach(() => {
    invoke = vi.fn(async () => ({
      ...CONFIG,
      agents: [{}, {}],
    }));
    standInBridge<ProjectChanged>({
      invoke,
      subscribe: (_channel, listener) => {
        tell = listener;
      },
    });
  });

  it("reads the file again itself when nothing is half-typed, and says what changed", async () => {
    const sayNote = vi.fn();

    render(<Probe isDirty={false} sayNote={sayNote} />);
    tell({
      directory: PROJECT.directory,
    });

    await waitFor(() => expect(sayNote).toHaveBeenCalled());

    expect(invoke).toHaveBeenCalledWith(OPEN_PROJECT_CHANNEL, {
      directory: PROJECT.directory,
    });
    expect(sayNote).toHaveBeenCalledWith({
      label: PROJECT_REREAD_LABEL,
      detail: "+2 агенти",
      reason: null,
    });
  });

  it("holds what arrived while a draft stands, and says nothing until it is answered", async () => {
    const sayNote = vi.fn();

    render(<Probe isDirty sayNote={sayNote} />);
    tell({
      directory: PROJECT.directory,
    });

    expect(await screen.findByText("тримає те, що прийшло")).toBeInTheDocument();
    expect(sayNote).not.toHaveBeenCalled();
  });

  it("says nothing about a folder that is not the open one", () => {
    const sayNote = vi.fn();

    render(<Probe isDirty={false} sayNote={sayNote} />);
    tell({
      directory: "/tmp/somebody-else",
    });

    expect(sayNote).not.toHaveBeenCalled();
    expect(invoke).not.toHaveBeenCalled();
  });
});

/** The channel the hook listens on is the one the main process sends on. */
describe("PROJECT_CHANGED_CHANNEL", () => {
  it("is the projects channel that runs the other way", () => {
    expect(PROJECT_CHANGED_CHANNEL).toBe("projects:changed");
  });
});
