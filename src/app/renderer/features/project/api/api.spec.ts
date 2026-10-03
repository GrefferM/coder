import { describe, expect, it, vi } from "vitest";
import { chooseProjectDirectory } from "./choose-project-directory";
import { closeProject } from "./close-project";
import { createProject } from "./create-project";
import { openProject } from "./open-project";
import { projectView, rememberProjectView } from "./project-view";
import { saveProject } from "./save-project";
import { CHOOSE_DIRECTORY_CHANNEL } from "../../../../../contracts";
import {
  CLOSE_PROJECT_CHANNEL,
  CREATE_PROJECT_CHANNEL,
  OPEN_PROJECT_CHANNEL,
  PROJECT_VIEW_CHANNEL,
  REMEMBER_PROJECT_VIEW_CHANNEL,
  SAVE_PROJECT_CHANNEL,
} from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";
import { standInBridge } from "../../../testing";

const CONFIG = {
  version: 1,
  name: "test",
  models: [],
  prompts: [],
  agents: [],
  links: [],
};

/** What the main process answers a reading with. */
const ON_DISK = {
  config: CONFIG,
  print: "print-1",
};

const VIEW = {
  pan: {
    x: -120,
    y: 40,
  },
  scale: 0.7,
  sectionId: "models",
  isCollapsed: false,
  aimedAgentId: null,
  fieldHeight: null,
};

function stubApi(result: unknown, byChannel: Record<string, unknown> = {}) {
  const invoke = vi.fn();

  invoke.mockImplementation(async (channel: string) => (channel in byChannel ? byChannel[channel] : result));
  standInBridge({
    invoke,
  });

  return invoke;
}

describe("project calls", () => {
  it("asks the system for a folder", async () => {
    const invoke = stubApi("/Users/olena/projects/test");

    expect(await chooseProjectDirectory()).toBe("/Users/olena/projects/test");
    expect(invoke).toHaveBeenCalledWith(CHOOSE_DIRECTORY_CHANNEL);
  });

  it("returns an opened project with the folder it came from", async () => {
    const invoke = stubApi(ON_DISK);

    expect(await openProject("/tmp/test")).toEqual({
      directory: "/tmp/test",
      config: CONFIG,
      // The print of the reading, which every save of it names.
      print: "print-1",
      view: null,
    });
    expect(invoke).toHaveBeenCalledWith(OPEN_PROJECT_CHANNEL, {
      directory: "/tmp/test",
    });
  });

  it("creates a project under the name the form holds", async () => {
    const invoke = stubApi(ON_DISK);

    await createProject("/Users/olena/projects/test/", "test");

    expect(invoke).toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, {
      directory: "/Users/olena/projects/test/",
      name: "test",
    });
  });

  it("saves made from a reading name it, and take back the print of what they left", async () => {
    const invoke = stubApi("print-2");

    expect(await saveProject("/tmp/test", <ProjectConfig>(<unknown>CONFIG), "print-1")).toBe("print-2");
    expect(invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
      directory: "/tmp/test",
      config: CONFIG,
      basis: "print-1",
    });
  });

  it("brings this machine's own view of a project back with it", async () => {
    stubApi(ON_DISK, {
      [PROJECT_VIEW_CHANNEL]: JSON.stringify(VIEW),
    });

    expect((await openProject("/tmp/test")).view).toEqual(VIEW);
  });

  it("takes a note it cannot read as no note at all, rather than opening onto nonsense", async () => {
    stubApi(ON_DISK, {
      [PROJECT_VIEW_CHANNEL]: "{ це не запис",
    });

    expect(await projectView("/tmp/test")).toBeNull();
  });

  it("takes a note missing what a view is made of as no note at all", async () => {
    stubApi(ON_DISK, {
      [PROJECT_VIEW_CHANNEL]: JSON.stringify({
        scale: 0.7,
      }),
    });

    expect(await projectView("/tmp/test")).toBeNull();
  });

  it("says the project has been put down, handing nothing over: one is open at a time", async () => {
    const invoke = stubApi(undefined);

    await closeProject();

    expect(invoke).toHaveBeenCalledWith(CLOSE_PROJECT_CHANNEL);
  });

  it("writes the view down as one string, since nobody on the other side opens it", async () => {
    const invoke = stubApi(undefined);

    await rememberProjectView("/tmp/test", VIEW);

    expect(invoke).toHaveBeenCalledWith(REMEMBER_PROJECT_VIEW_CHANNEL, {
      directory: "/tmp/test",
      view: JSON.stringify(VIEW),
    });
  });
});
