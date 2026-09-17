import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { openTestDatabase } from "../../../utils/testing";
import { ProjectEntryEntity } from "../entities";
import { ProjectConfigDto } from "../dto";
import { PROJECT_ALREADY_THERE } from "../constants";
import { FolderContents, ProjectFileStore, ProjectHistory, ProjectWatch } from "../interfaces";
import { ProjectService } from "./project.service";
import type { Repository } from "typeorm";
import type { TestDatabase } from "../../../utils/testing";

class ProjectFileStoreStub implements ProjectFileStore {
  written: ProjectConfigDto | null = null;
  stored: ProjectConfigDto | null = null;
  steps: string[] = [];
  isFailing = false;

  async read(): Promise<ProjectConfigDto> {
    if (!this.stored) {
      throw new Error("No project saved in that folder.");
    }

    return this.stored;
  }

  async write(_projectDirectory: string, config: ProjectConfigDto): Promise<void> {
    this.steps.push(`write ${config.name}`);

    // A folder of files takes more than one tick to write, which is where a second save gets in.
    await Promise.resolve();

    if (this.isFailing) {
      throw new Error("The folder could not be written.");
    }

    this.written = config;
    this.stored = config;
    this.steps.push(`wrote ${config.name}`);
  }

  async exists(): Promise<boolean> {
    return this.stored !== null;
  }

  async glance(projectDirectory: string): Promise<FolderContents> {
    return {
      hasProject: this.stored !== null,
      name: this.stored?.name ?? projectDirectory.split("/").filter(Boolean).at(-1) ?? "",
      agentCount: this.stored?.agents.length ?? 0,
      linkCount: this.stored?.links.length ?? 0,
      promptCount: this.stored?.prompts.length ?? 0,
    };
  }
}

class ProjectWatchStub implements ProjectWatch {
  followed: string | null = null;
  remembered: string | null = null;

  constructor(private readonly projectFileStore: ProjectFileStoreStub) {}

  async follow(directory: string): Promise<void> {
    this.followed = directory;
  }

  unfollow(): void {
    this.followed = null;
  }

  /** The fingerprint of what stands in the folder at this moment. */
  async remember(directory: string): Promise<void> {
    this.remembered = directory;
    this.projectFileStore.steps.push(`fingerprint of ${this.projectFileStore.stored?.name ?? "nothing"}`);
  }
}

/** The same project under another name, which is what a step in the log names its save by. */
function named(config: ProjectConfigDto, name: string): ProjectConfigDto {
  return <ProjectConfigDto>{
    ...config,
    name,
  };
}

class ProjectHistoryStub implements ProjectHistory {
  forgotten: string | null = null;

  async forgetProject(directory: string): Promise<void> {
    this.forgotten = directory;
  }
}

describe("ProjectService", () => {
  let record: TestDatabase;
  let entries: Repository<ProjectEntryEntity>;
  let projectService: ProjectService;
  let projectFileStore: ProjectFileStoreStub;
  let projectWatch: ProjectWatchStub;
  let projectHistory: ProjectHistoryStub;

  beforeEach(async () => {
    projectFileStore = new ProjectFileStoreStub();
    projectWatch = new ProjectWatchStub(projectFileStore);
    projectHistory = new ProjectHistoryStub();
    record = await openTestDatabase();
    entries = record.dataSource.getRepository(ProjectEntryEntity);
    projectService = new ProjectService(entries, projectFileStore, projectWatch, projectHistory);
  });

  afterEach(async () => {
    await record.close();
  });

  it("writes an empty project into the folder it is given", async () => {
    const config = await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    assert.equal(config.name, "Coder");
    assert.equal(projectFileStore.written, config);
    // Every list is there and empty. One left out arrives at the screen as `undefined` and takes the screen down.
    assert.deepEqual(config.models, []);
    assert.deepEqual(config.prompts, []);
    assert.deepEqual(config.commands, []);
    assert.deepEqual(config.agents, []);
    assert.deepEqual(config.links, []);
  });

  it("remembers a created project", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    const [entry] = await projectService.findRecent();

    assert.equal(entry.directory, "/tmp/one");
    assert.equal(entry.name, "Coder");
  });

  it("reads the project back when opening its folder", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    const config = await projectService.open({
      directory: "/tmp/one",
    });

    assert.equal(config.name, "Coder");
  });

  it("remembers a folder once, however many times it is opened", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });
    await projectService.open({
      directory: "/tmp/one",
    });

    assert.equal((await projectService.findRecent()).length, 1);
  });

  it("takes the name from the file, not from what it remembered", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    projectFileStore.stored!.name = "Renamed elsewhere";

    await projectService.open({
      directory: "/tmp/one",
    });

    const [entry] = await projectService.findRecent();

    assert.equal(entry.name, "Renamed elsewhere");
  });

  it("makes a project out of a chosen folder that has none, named after the folder", async () => {
    const config = await projectService.openOrCreate({
      directory: "/tmp/projects/test",
    });

    assert.equal(config.name, "test");
    assert.equal(projectFileStore.written?.name, "test");
  });

  it("reads a chosen folder that already holds a project instead of overwriting it", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });
    projectFileStore.written = null;

    const config = await projectService.openOrCreate({
      directory: "/tmp/one",
    });

    assert.equal(config.name, "Coder");
    assert.equal(projectFileStore.written, null);
  });

  it("says of every known project whether its folder still holds one", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    const [entry] = await projectService.findRecent();

    assert.equal(entry.exists, true);
  });

  it("drops a project from the list without touching its folder", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });
    await projectService.forget({
      directory: "/tmp/one",
    });

    assert.deepEqual(await projectService.findRecent(), []);
    assert.notEqual(projectFileStore.stored, null);
  });

  it("takes the project's history of deletions off this machine with it, since the row was the only way back to it", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });
    await projectService.forget({
      directory: "/tmp/one",
    });

    assert.equal(projectHistory.forgotten, "/tmp/one");
  });

  it("lets a forgotten folder be added again, since its row is gone rather than marked deleted", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });
    await projectService.forget({
      directory: "/tmp/one",
    });
    await projectService.open({
      directory: "/tmp/one",
    });

    const [entry] = await projectService.findRecent();

    assert.equal(entry.directory, "/tmp/one");
  });

  it("brings a row marked deleted back rather than inserting a second one for the same folder", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    const [entry] = await projectService.findRecent();

    await entries.softDelete(entry.id);
    await projectService.open({
      directory: "/tmp/one",
    });

    const remembered = await projectService.findRecent();

    assert.equal(remembered.length, 1);
    assert.equal(remembered[0].id, entry.id);
  });

  it("refuses to open a folder holding no project, saying which failure it is", async () => {
    await assert.rejects(
      () =>
        projectService.open({
          directory: "/tmp/empty",
        }),
      /PROJECT_NOT_FOUND/,
    );
  });

  it("refuses to write a project over one that is already in the folder", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    await assert.rejects(
      projectService.create({
        directory: "/tmp/one",
        name: "Coder again",
      }),
      new RegExp(PROJECT_ALREADY_THERE),
    );
  });

  it("says an empty folder holds no project, and names it after the folder", async () => {
    const contents = await projectService.look({
      directory: "/tmp/nightly-checks",
    });

    assert.deepEqual(contents, {
      hasProject: false,
      name: "nightly-checks",
      agentCount: 0,
      linkCount: 0,
      promptCount: 0,
    });
  });

  it("counts what is in a folder that already holds a project", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    projectFileStore.stored = <ProjectConfigDto>{
      ...projectFileStore.stored,
      agents: [<never>{}, <never>{}],
      links: [<never>{}],
      prompts: [<never>{}, <never>{}, <never>{}],
    };

    const contents = await projectService.look({
      directory: "/tmp/one",
    });

    assert.deepEqual(contents, {
      hasProject: true,
      name: "Coder",
      agentCount: 2,
      linkCount: 1,
      promptCount: 3,
    });
  });

  it("follows the folder it opened and takes its own writes as read", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    assert.equal(projectWatch.followed, "/tmp/one");

    await projectService.save({
      directory: "/tmp/one",
      config: <ProjectConfigDto>projectFileStore.stored,
    });

    assert.equal(projectWatch.remembered, "/tmp/one");
  });

  it("puts the watch down when the project is closed, leaving no folder followed", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    projectService.close();

    assert.equal(projectWatch.followed, null);
  });

  it("keeps this machine's view of a project and hands it back", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });
    await projectService.rememberView({
      directory: "/tmp/one",
      view: '{"scale":0.7}',
    });

    assert.equal(
      await projectService.viewOf({
        directory: "/tmp/one",
      }),
      '{"scale":0.7}',
    );
  });

  it("has no view for a folder it has never opened, rather than inventing one", async () => {
    assert.equal(
      await projectService.viewOf({
        directory: "/tmp/never",
      }),
      null,
    );
  });

  it("notes nothing for a folder it does not know, instead of making a row for it", async () => {
    await projectService.rememberView({
      directory: "/tmp/never",
      view: '{"scale":0.7}',
    });

    assert.deepEqual(await projectService.findRecent(), []);
  });

  it("holds a second save of one folder until the first is done, so no fingerprint is of a half-written folder", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    const stored = <ProjectConfigDto>projectFileStore.stored;

    projectFileStore.steps = [];

    const first = projectService.save({
      directory: "/tmp/one",
      config: named(stored, "one"),
    });
    const second = projectService.save({
      directory: "/tmp/one",
      config: named(stored, "two"),
    });

    await Promise.all([first, second]);

    assert.deepEqual(projectFileStore.steps, [
      "write one",
      "wrote one",
      "fingerprint of one",
      "write two",
      "wrote two",
      "fingerprint of two",
    ]);
  });

  it("holds up no save of another folder, since the queue is one folder's own", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    const stored = <ProjectConfigDto>projectFileStore.stored;

    projectFileStore.steps = [];

    const first = projectService.save({
      directory: "/tmp/one",
      config: named(stored, "one"),
    });
    const second = projectService.save({
      directory: "/tmp/two",
      config: named(stored, "two"),
    });

    await Promise.all([first, second]);

    assert.deepEqual(projectFileStore.steps.slice(0, 2), ["write one", "write two"]);
  });

  it("lets the next save of a folder through after one of them failed, rather than wedging the queue", async () => {
    await projectService.create({
      directory: "/tmp/one",
      name: "Coder",
    });

    const stored = <ProjectConfigDto>projectFileStore.stored;

    projectFileStore.isFailing = true;

    await assert.rejects(
      projectService.save({
        directory: "/tmp/one",
        config: named(stored, "one"),
      }),
    );

    projectFileStore.isFailing = false;

    await projectService.save({
      directory: "/tmp/one",
      config: named(stored, "two"),
    });

    assert.equal(projectFileStore.stored?.name, "two");
  });
});
