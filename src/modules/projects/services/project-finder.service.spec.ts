import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { ProjectFinder } from "./project-finder.service";
import { aConfig } from "../../../contracts/testing";
import type { KnownProject, ProjectOpener, ProjectRead } from "../interfaces";
import type { OpenProjectDto } from "../dto";

function known(name: string, directory: string, exists = true): KnownProject {
  return {
    id: directory,
    name,
    directory,
    openedAt: new Date(2026, 9, 1),
    exists,
    agentCount: 2,
  };
}

/** A project list that holds these projects and reads every folder it is asked to as the same config. */
function listing(recent: KnownProject[]) {
  const opened: string[] = [];
  const projects: ProjectOpener = {
    findRecent: async () => recent,
    open: async (payload: OpenProjectDto) => {
      opened.push(payload.directory);

      return <ProjectRead>{
        config: aConfig({
          name: "Coder",
        }),
        print: "print-1",
      };
    },
  };

  return {
    finder: new ProjectFinder(projects),
    opened,
  };
}

describe("ProjectFinder", () => {
  it("finds a project by its name, whatever the case", async () => {
    const { finder, opened } = listing([known("Coder", "/work/coder"), known("Other", "/work/other")]);
    const found = await finder.find("coder");

    assert.equal(found.directory, "/work/coder");
    assert.equal(found.config.name, "Coder");
    assert.deepEqual(opened, ["/work/coder"]);
  });

  it("takes a path as the folder itself, made absolute", async () => {
    const { finder, opened } = listing([]);
    const found = await finder.find("./some/folder");

    assert.equal(found.directory, path.resolve("./some/folder"));
    assert.deepEqual(opened, [path.resolve("./some/folder")]);
  });

  it("names the projects this machine knows when none has that name", async () => {
    const { finder } = listing([known("Coder", "/work/coder"), known("Gone", "/work/gone", false)]);

    await assert.rejects(finder.find("nothing"), /nothing.*Coder/);
    await assert.rejects(finder.find("gone"), /Відомі проєкти: Coder$/);
  });

  it("says so when the machine has opened no project at all", async () => {
    const { finder } = listing([]);

    await assert.rejects(finder.find("coder"), /ще не відкривав жодного/);
  });

  it("asks for the folder when several projects bear the name", async () => {
    const { finder, opened } = listing([known("Coder", "/a/coder"), known("Coder", "/b/coder")]);

    await assert.rejects(finder.find("Coder"), /\/a\/coder, \/b\/coder/);
    assert.deepEqual(opened, []);
  });
});
