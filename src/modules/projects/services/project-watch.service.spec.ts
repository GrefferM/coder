import assert from "node:assert/strict";
import { mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { setTimeout as wait } from "node:timers/promises";
import { PROJECT_FILE_NAME, PROJECT_PART_DIRECTORIES, PROJECT_WATCH_SETTLE_MS } from "../constants";
import { ProjectWatchService } from "./project-watch.service";
import type { ProjectVoice } from "../interfaces";

/** Long enough for the watch to settle and read the file. */
const HEARD_MS = PROJECT_WATCH_SETTLE_MS * 4;

/** Waits allowed before a word counts as never said. */
const HEARD_TRIES = 10;

/** A part file is named by its own id; only such names belong to the project. */
const AGENT_ID = "0f1e2d3c-4b5a-4968-8778-69504a3b2c1d";

describe("ProjectWatchService", () => {
  let directory: string;
  let heard: string[];
  let voice: ProjectVoice;
  let watches: ProjectWatchService[];

  /** A watch put down when the test ends. */
  function watching(): ProjectWatchService {
    const watch = new ProjectWatchService(voice);

    watches.push(watch);

    return watch;
  }

  /** What the watch said, after giving the file system time to say it. */
  async function spoken(): Promise<string[]> {
    for (let step = 0; step < HEARD_TRIES && heard.length === 0; step += 1) {
      await wait(HEARD_MS);
    }

    return heard;
  }

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), "coder-watch-"));
    heard = [];
    watches = [];
    voice = {
      changed: (changed) => {
        heard.push(changed);
      },
    };

    await writeFile(path.join(directory, PROJECT_FILE_NAME), "version: 1\nname: one\n");
  });

  afterEach(() => {
    for (const watch of watches) {
      watch.unfollow();
    }
  });

  it("says the folder changed when somebody else writes the file", async () => {
    const watch = watching();

    await watch.follow(directory);
    // A watch the system has not finished arming hears nothing.
    await wait(PROJECT_WATCH_SETTLE_MS);
    await writeFile(path.join(directory, PROJECT_FILE_NAME), "version: 1\nname: two\n");

    assert.deepEqual(await spoken(), [directory]);
  });

  it("says nothing about a write the app itself has taken as read", async () => {
    const watch = watching();

    await watch.follow(directory);
    await writeFile(path.join(directory, PROJECT_FILE_NAME), "version: 1\nname: ours\n");
    await watch.remember(directory);
    await wait(HEARD_MS);

    assert.deepEqual(heard, []);
  });

  it("says nothing when the file was touched without its text changing", async () => {
    const watch = watching();

    await watch.follow(directory);
    await writeFile(path.join(directory, PROJECT_FILE_NAME), "version: 1\nname: one\n");
    await wait(HEARD_MS);

    assert.deepEqual(heard, []);
  });

  it("follows one folder at a time, leaving the one it left alone", async () => {
    const other = await mkdtemp(path.join(os.tmpdir(), "coder-watch-"));
    const watch = watching();

    await writeFile(path.join(other, PROJECT_FILE_NAME), "version: 1\nname: other\n");
    await watch.follow(directory);
    await watch.follow(other);
    await writeFile(path.join(directory, PROJECT_FILE_NAME), "version: 1\nname: changed\n");
    await wait(HEARD_MS);

    assert.deepEqual(heard, []);
  });

  it("notices a change that landed before the watch was listening", async () => {
    // A change between opening a watch and its first delivery is never queued; the watch's own sweep read finds it (see
    // `sweep`).
    const watch = watching();

    await watch.follow(directory);
    await writeFile(path.join(directory, PROJECT_FILE_NAME), "version: 1\nname: two\n");

    assert.deepEqual(await spoken(), [directory]);
  });

  it("keeps hearing after the file is replaced rather than written over", async () => {
    const watch = watching();
    const filePath = path.join(directory, PROJECT_FILE_NAME);

    await watch.follow(directory);
    // Every app write and every editor save is a rename over the old file.
    await writeFile(`${filePath}.tmp`, "version: 1\nname: two\n");
    await rename(`${filePath}.tmp`, filePath);

    assert.deepEqual(await spoken(), [directory]);

    heard.length = 0;
    await writeFile(filePath, "version: 1\nname: three\n");

    // The watch is on the folder, so replacing the file does not end it.
    assert.deepEqual(await spoken(), [directory]);
  });

  it("says the folder changed when a part file changes, not only the config", async () => {
    const watch = watching();
    const agentPath = path.join(directory, PROJECT_PART_DIRECTORIES.agents, `${AGENT_ID}.yaml`);

    await mkdir(path.dirname(agentPath), {
      recursive: true,
    });
    await writeFile(agentPath, "name: EDITOR\n");
    await watch.follow(directory);
    // A watch the system has not finished arming hears nothing.
    await wait(PROJECT_WATCH_SETTLE_MS);
    await writeFile(agentPath, "name: REVIEWER\n");

    assert.deepEqual(await spoken(), [directory]);
  });

  it("says the folder changed when a part file is taken away", async () => {
    const watch = watching();
    const agentPath = path.join(directory, PROJECT_PART_DIRECTORIES.agents, `${AGENT_ID}.yaml`);

    await mkdir(path.dirname(agentPath), {
      recursive: true,
    });
    await writeFile(agentPath, "name: EDITOR\n");
    await watch.follow(directory);
    // A removal is a single event; an unarmed watch misses it.
    await wait(PROJECT_WATCH_SETTLE_MS);
    await rm(agentPath);

    assert.deepEqual(await spoken(), [directory]);
  });

  it("says nothing about a file in the folder that is not the project's", async () => {
    const watch = watching();

    await watch.follow(directory);
    // A report written into the folder is not a project change.
    await writeFile(path.join(directory, "report.md"), "# Звіт\n");
    await wait(HEARD_MS);

    assert.deepEqual(heard, []);
  });
});
