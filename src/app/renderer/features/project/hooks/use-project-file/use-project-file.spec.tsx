import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  print: "print-1",
  view: null,
};

/** The one channel listener the hook adds, kept so a test can act as the main process. */
let tell: (changed: { directory: string }) => void;

const DRAFT: UnsavedWork = {
  name: "EDITOR",
  changes: [],
  blocked: [],
  blockedNote: null,
  save: async () => {},
  discard: () => {},
};

/** The hook renders nothing; the probe shows what it holds and offers «Лишити моє». */
function Probe({
  isDirty,
  sayNote,
  setProject = () => {},
}: {
  isDirty: boolean;
  sayNote: (note: WriteNote) => void;
  setProject?: (project: OpenProject) => void;
}) {
  const { arrived, keepMine } = useProjectFile(
    PROJECT,
    (change) => setProject(change as OpenProject),
    isDirty ? DRAFT : null,
    sayNote,
  );

  return (
    <>
      <span>{arrived === null ? "нічого не тримає" : "тримає те, що прийшло"}</span>
      <button onClick={keepMine}>Лишити моє</button>
    </>
  );
}

/** What the folder holds after the change: two more agents. */
const ARRIVED = {
  ...CONFIG,
  agents: [{}, {}],
} as unknown as ProjectConfig;

describe("useProjectFile", () => {
  let invoke: Mock<(channel: string, payload?: unknown) => unknown>;

  beforeEach(() => {
    invoke = vi.fn(async (channel: string) =>
      channel === OPEN_PROJECT_CHANNEL
        ? {
            config: ARRIVED,
            print: "print-2",
          }
        : null,
    );
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
      isRefusal: false,
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

  it("takes what arrived under «Лишити моє», keeping the draft laid over it rather than the old project", async () => {
    // Guards a save of the draft writing back everything else that changed on disk.
    const sayNote = vi.fn();
    const setProject = vi.fn();

    render(<Probe isDirty sayNote={sayNote} setProject={setProject} />);
    tell({
      directory: PROJECT.directory,
    });
    await screen.findByText("тримає те, що прийшло");
    await userEvent.click(screen.getByText("Лишити моє"));

    expect(setProject).toHaveBeenCalledWith({
      directory: PROJECT.directory,
      config: ARRIVED,
      print: "print-2",
      view: null,
    });
    expect(screen.getByText("нічого не тримає")).toBeInTheDocument();
    expect(sayNote).toHaveBeenCalledWith(
      expect.objectContaining({
        label: PROJECT_REREAD_LABEL,
      }),
    );
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

/** The hook listens on the channel the main process sends on. */
describe("PROJECT_CHANGED_CHANNEL", () => {
  it("is the projects channel that runs the other way", () => {
    expect(PROJECT_CHANGED_CHANNEL).toBe("projects:changed");
  });
});
