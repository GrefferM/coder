import { describe, expect, it, vi } from "vitest";
import { chooseProjectDirectory } from "./choose-project-directory";
import { createProject } from "./create-project";
import { openProject } from "./open-project";
import { projectView, rememberProjectView } from "./project-view";
import { CHOOSE_DIRECTORY_CHANNEL } from "../../../../../contracts";
import {
  CREATE_PROJECT_CHANNEL,
  OPEN_PROJECT_CHANNEL,
  PROJECT_VIEW_CHANNEL,
  REMEMBER_PROJECT_VIEW_CHANNEL,
} from "../../../../../contracts";
import { standInBridge } from "../../../testing";

const CONFIG = {
  version: 1,
  name: "test",
  models: [],
  prompts: [],
  agents: [],
  links: [],
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
    const invoke = stubApi(CONFIG);

    expect(await openProject("/tmp/test")).toEqual({
      directory: "/tmp/test",
      config: CONFIG,
      view: null,
    });
    expect(invoke).toHaveBeenCalledWith(OPEN_PROJECT_CHANNEL, {
      directory: "/tmp/test",
    });
  });

  it("creates a project under the name the form holds", async () => {
    const invoke = stubApi(CONFIG);

    await createProject("/Users/olena/projects/test/", "test");

    expect(invoke).toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, {
      directory: "/Users/olena/projects/test/",
      name: "test",
    });
  });

  it("brings this machine's own view of a project back with it", async () => {
    stubApi(CONFIG, {
      [PROJECT_VIEW_CHANNEL]: JSON.stringify(VIEW),
    });

    expect((await openProject("/tmp/test")).view).toEqual(VIEW);
  });

  it("takes a note it cannot read as no note at all, rather than opening onto nonsense", async () => {
    stubApi(CONFIG, {
      [PROJECT_VIEW_CHANNEL]: "{ це не запис",
    });

    expect(await projectView("/tmp/test")).toBeNull();
  });

  it("takes a note missing what a view is made of as no note at all", async () => {
    stubApi(CONFIG, {
      [PROJECT_VIEW_CHANNEL]: JSON.stringify({
        scale: 0.7,
      }),
    });

    expect(await projectView("/tmp/test")).toBeNull();
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
