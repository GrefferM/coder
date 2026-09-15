import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  CreateProjectDto,
  ForgetProjectDto,
  OpenProjectDto,
  ProjectConfigDto,
  ProjectController,
} from "../../../src/modules";
import { ProjectService } from "../../../src/modules/projects/services";
import {
  FolderContents,
  ProjectFileStore,
  ProjectHistory,
  ProjectWatch,
} from "../../../src/modules/projects/interfaces";
import { ProjectEntryEntity } from "../../../src/modules/projects/entities";
import { openTestDatabase } from "../../../src/utils/testing";
import type { TestDatabase } from "../../../src/utils/testing";

/** One config per directory, held in memory. */
class ProjectFileStoreStub implements ProjectFileStore {
  private readonly configs = new Map<string, ProjectConfigDto>();

  async read(projectDirectory: string): Promise<ProjectConfigDto> {
    const config = this.configs.get(projectDirectory);

    if (!config) {
      throw new Error("No project saved in that folder.");
    }

    return config;
  }

  async write(projectDirectory: string, config: ProjectConfigDto): Promise<void> {
    this.configs.set(projectDirectory, config);
  }

  async exists(projectDirectory: string): Promise<boolean> {
    return this.configs.has(projectDirectory);
  }

  async glance(projectDirectory: string): Promise<FolderContents> {
    const config = this.configs.get(projectDirectory);

    return {
      hasProject: config !== undefined,
      name: config?.name ?? projectDirectory.split("/").filter(Boolean).at(-1) ?? "",
      agentCount: config?.agents.length ?? 0,
      linkCount: config?.links.length ?? 0,
      promptCount: config?.prompts.length ?? 0,
    };
  }
}

function createProjectDto(directory: string, name = "Coder"): CreateProjectDto {
  return Object.assign(new CreateProjectDto(), {
    directory,
    name,
  });
}

function openProjectDto(directory: string): OpenProjectDto {
  return Object.assign(new OpenProjectDto(), {
    directory,
  });
}

class ProjectWatchStub implements ProjectWatch {
  async follow(): Promise<void> {}

  async remember(): Promise<void> {}

  unfollow(): void {}
}

class ProjectHistoryStub implements ProjectHistory {
  async forgetProject(): Promise<void> {}
}

describe("ProjectController", () => {
  let record: TestDatabase;
  let projectController: ProjectController;

  beforeEach(async () => {
    // A real database of its own, made and thrown away for each test; the app's own is never touched.
    record = await openTestDatabase();
    projectController = new ProjectController(
      new ProjectService(
        record.dataSource.getRepository(ProjectEntryEntity),
        new ProjectFileStoreStub(),
        new ProjectWatchStub(),
        new ProjectHistoryStub(),
      ),
    );
  });

  afterEach(async () => {
    await record.close();
  });

  it("creates an empty project and remembers its folder", async () => {
    const config = await projectController.create(createProjectDto("/tmp/one"));

    assert.equal(config.name, "Coder");
    assert.deepEqual(config.agents, []);

    const [entry] = await projectController.findRecent();

    assert.equal(entry.directory, "/tmp/one");
    assert.equal(entry.exists, true);
  });

  it("rejects a create payload without a directory", async () => {
    await assert.rejects(() => projectController.create(createProjectDto("")));
  });

  it("makes a chosen folder a project when it holds none, and reads it when it does", async () => {
    const created = await projectController.openOrCreate(openProjectDto("/tmp/projects/test"));

    assert.equal(created.name, "test");

    const reread = await projectController.openOrCreate(openProjectDto("/tmp/projects/test"));

    assert.equal(reread.name, "test");
  });

  it("refuses to open a folder holding no project, saying which failure it is", async () => {
    await assert.rejects(() => projectController.open(openProjectDto("/tmp/empty")), /PROJECT_NOT_FOUND/);
  });

  it("forgets a folder and lets it be added again", async () => {
    await projectController.create(createProjectDto("/tmp/one"));
    await projectController.forget(
      Object.assign(new ForgetProjectDto(), {
        directory: "/tmp/one",
      }),
    );

    assert.deepEqual(await projectController.findRecent(), []);

    await projectController.open(openProjectDto("/tmp/one"));

    const entries = await projectController.findRecent();

    assert.equal(entries.length, 1);
  });

  it("refuses to create a project in a folder that already holds one", async () => {
    await projectController.create(createProjectDto("/tmp/one"));

    await assert.rejects(() => projectController.create(createProjectDto("/tmp/one")), /PROJECT_ALREADY_THERE/);
  });

  it("says what a folder holds before anything is written to it", async () => {
    await projectController.create(createProjectDto("/tmp/one"));

    assert.deepEqual(await projectController.look(openProjectDto("/tmp/one")), {
      hasProject: true,
      name: "Coder",
      agentCount: 0,
      linkCount: 0,
      promptCount: 0,
    });
    assert.deepEqual(await projectController.look(openProjectDto("/tmp/nightly-checks")), {
      hasProject: false,
      name: "nightly-checks",
      agentCount: 0,
      linkCount: 0,
      promptCount: 0,
    });
  });
});
