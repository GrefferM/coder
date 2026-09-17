import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CreateProjectDto,
  OpenProjectDto,
  ProjectConfigDto,
  ProjectController,
  SaveProjectDto,
} from "../../../modules";
import {
  CLOSE_PROJECT_CHANNEL,
  CREATE_PROJECT_CHANNEL,
  LIST_RECENT_PROJECTS_CHANNEL,
  OPEN_PROJECT_CHANNEL,
  SAVE_PROJECT_CHANNEL,
} from "../../../contracts";
import { PROJECTS_IPC_CHANNELS } from "./projects-ipc-channels";

function controllerRecording(received: unknown[]): ProjectController {
  return <ProjectController>(<unknown>{
    create: async (payload: unknown) => {
      received.push(payload);
    },
    open: async (payload: unknown) => {
      received.push(payload);
    },
    save: async (payload: unknown) => {
      received.push(payload);
    },
    findRecent: async () => {
      received.push("findRecent");
    },
    close: async () => {
      received.push("close");
    },
  });
}

describe("PROJECTS_IPC_CHANNELS", () => {
  it("rebuilds a create payload into a real DTO, so its decorators are readable", async () => {
    const received: unknown[] = [];

    await PROJECTS_IPC_CHANNELS[CREATE_PROJECT_CHANNEL](controllerRecording(received), {
      directory: "/tmp/one",
      name: "Coder",
    });

    assert.ok(received[0] instanceof CreateProjectDto);
    assert.equal((<CreateProjectDto>received[0]).directory, "/tmp/one");
  });

  it("rebuilds an open payload into a real DTO", async () => {
    const received: unknown[] = [];

    await PROJECTS_IPC_CHANNELS[OPEN_PROJECT_CHANNEL](controllerRecording(received), {
      directory: "/tmp/one",
    });

    assert.ok(received[0] instanceof OpenProjectDto);
  });

  it("rebuilds a save payload, config and all, so the whole document validates", async () => {
    const received: unknown[] = [];

    await PROJECTS_IPC_CHANNELS[SAVE_PROJECT_CHANNEL](controllerRecording(received), {
      directory: "/tmp/one",
      config: {
        version: 1,
        name: "Coder",
        models: [],
        prompts: [],
        agents: [],
        links: [],
      },
    });

    const [saved] = received;

    assert.ok(saved instanceof SaveProjectDto);
    assert.ok((<SaveProjectDto>saved).config instanceof ProjectConfigDto);
  });

  it("puts the open project down with no payload at all, since one is open at a time", async () => {
    const received: unknown[] = [];

    await PROJECTS_IPC_CHANNELS[CLOSE_PROJECT_CHANNEL](controllerRecording(received), undefined);

    assert.deepEqual(received, ["close"]);
  });

  it("asks for the recent list with no payload at all", async () => {
    const received: unknown[] = [];

    await PROJECTS_IPC_CHANNELS[LIST_RECENT_PROJECTS_CHANNEL](controllerRecording(received), undefined);

    assert.deepEqual(received, ["findRecent"]);
  });
});
