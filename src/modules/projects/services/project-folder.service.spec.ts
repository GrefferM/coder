import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { ProjectFolder } from "./project-folder.service";
import type { ProjectPromptDto } from "../dto";

const PROMPT = <ProjectPromptDto>(<unknown>{
  id: "prompt-1",
  name: "Правки коду",
  file: "prompts/prompt-1.md",
  text: "Ти правиш код.",
});

/** A folder of its own for each test, in the system's temporary place; nobody's project is touched. */
let folder: string;
let files: ProjectFolder;

async function put(relative: string, contents: string): Promise<string> {
  const at = path.join(folder, relative);

  await mkdir(path.dirname(at), {
    recursive: true,
  });
  await writeFile(at, contents, "utf8");

  return at;
}

describe("ProjectFolder · where the files lie", () => {
  beforeEach(async () => {
    folder = await mkdtemp(path.join(os.tmpdir(), "coder-folder-"));
    files = new ProjectFolder();
  });

  afterEach(async () => {
    await rm(folder, {
      recursive: true,
      force: true,
    });
  });

  it("names the project's own file, its parts and its prompts", () => {
    assert.equal(files.filePath("/tmp/coder"), "/tmp/coder/project.yaml");
    assert.equal(files.partFile("agents", "agent-1"), "agents/agent-1.yaml");
    assert.equal(files.partPath("/tmp/coder", "agents", "agent-1"), "/tmp/coder/agents/agent-1.yaml");
    assert.equal(files.promptFile(PROMPT), "prompts/prompt-1.md");
    // The prompt's own file is where the project says it is, and not where the id would put it.
    assert.equal(files.promptPath("/tmp/coder", PROMPT), "/tmp/coder/prompts/prompt-1.md");
  });

  it("says whether a file is there without reading it", async () => {
    await put("project.yaml", "name: coder\n");

    assert.equal(await files.isThere(path.join(folder, "project.yaml")), true);
    assert.equal(await files.isThere(path.join(folder, "nothing.yaml")), false);
  });

  it("gives a file's text, and nothing at all where there is no file", async () => {
    // Nothing is not an empty file: one says «немає», the other says «є, і порожній».
    await put("project.yaml", "name: coder\n");
    await put("empty.yaml", "");

    assert.equal(await files.textOf(path.join(folder, "project.yaml")), "name: coder\n");
    assert.equal(await files.textOf(path.join(folder, "empty.yaml")), "");
    assert.equal(await files.textOf(path.join(folder, "nothing.yaml")), null);
  });

  it("reads a missing directory as an empty one", async () => {
    await put("agents/agent-1.yaml", "id: agent-1\n");

    assert.deepEqual(await files.namesIn(path.join(folder, "agents")), ["agent-1.yaml"]);
    assert.deepEqual(await files.namesIn(path.join(folder, "models")), []);
  });
});

describe("ProjectFolder · writing and moving", () => {
  beforeEach(async () => {
    folder = await mkdtemp(path.join(os.tmpdir(), "coder-folder-"));
    files = new ProjectFolder();
  });

  afterEach(async () => {
    await rm(folder, {
      recursive: true,
      force: true,
    });
  });

  it("writes a file into a folder that is not there yet, and leaves no half-written one behind", async () => {
    const at = path.join(folder, "prompts", "prompt-1.md");

    await files.writeAtomically(at, "Ти правиш код.");

    assert.equal(await files.textOf(at), "Ти правиш код.");
    // The write goes through a temporary name, and that name must not be left lying in the person's folder.
    assert.deepEqual(await readdir(path.join(folder, "prompts")), ["prompt-1.md"]);
  });

  it("does not touch a file that already holds exactly this text", async () => {
    // A write that changes nothing still changes the file's hour, and a folder watched from outside would say so.
    const at = await put("project.yaml", "name: coder\n");
    const before = await stat(at);

    await files.writeIfChanged(at, "name: coder\n");

    assert.equal((await stat(at)).mtimeMs, before.mtimeMs);
  });

  it("writes when the text is not the same", async () => {
    const at = await put("project.yaml", "name: coder\n");

    await files.writeIfChanged(at, "name: coder again\n");

    assert.equal(await files.textOf(at), "name: coder again\n");
  });

  it("moves a file, making the folder it is moving into", async () => {
    const from = await put("prompts/prompt-1.md", "Ти правиш код.");
    const to = path.join(folder, "prompts", "moved", "prompt-2.md");

    await files.moveIfThere(from, to);

    assert.equal(await files.textOf(to), "Ти правиш код.");
    assert.equal(await files.isThere(from), false);
  });

  it("says nothing about moving a file that is not there", async () => {
    // The body will be written at the new path anyway, so a missing source is not a failure to shout about.
    const to = path.join(folder, "prompts", "prompt-2.md");

    await files.moveIfThere(path.join(folder, "prompts", "nothing.md"), to);

    assert.equal(await files.isThere(to), false);
  });

  it("takes a file away, and says nothing about one that has already gone", async () => {
    const at = await put("prompts/prompt-1.md", "Ти правиш код.");

    await files.forget(at);

    assert.equal(await files.isThere(at), false);

    await files.forget(at);
  });
});
