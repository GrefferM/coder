import { readdir, readFile } from "node:fs/promises";
import { watch } from "node:fs";
import path from "node:path";
import type { FSWatcher } from "node:fs";
import {
  PART_FILE_PATTERN,
  PROJECT_FILE_NAME,
  PROJECT_PART_DIRECTORIES,
  PROJECT_WATCH_SETTLE_MS,
  PROMPTS_DIRECTORY_NAME,
  PROMPT_FILE_PATTERN,
} from "../constants";
import type { ProjectVoice, ProjectWatch } from "../interfaces";

/** Watches the open project's folder and reports outside changes, not the app's own writes. */
export class ProjectWatchService implements ProjectWatch {
  private watcher: FSWatcher | null = null;
  private followed: string | null = null;
  private known: string | null = null;
  private settling: NodeJS.Timeout | null = null;
  private sweeping: NodeJS.Timeout | null = null;
  /**
   * Reads of the folder run one after another. Two in flight both compare a folder that has already changed
   * against the same old fingerprint, so both find it changed and the change is said twice.
   */
  private reading: Promise<void> = Promise.resolve();

  constructor(private readonly voice: ProjectVoice) {}

  async follow(directory: string): Promise<void> {
    this.stop();
    this.followed = directory;

    return this.queue(() => this.record(directory));
  }

  /** Puts the watch down: nothing is followed and nothing is remembered until `follow` is called again. */
  unfollow(): void {
    this.stop();
    this.followed = null;
    this.known = null;
  }

  async remember(directory: string): Promise<void> {
    if (directory !== this.followed) {
      return;
    }

    // A read waiting on our own write has nothing left to say: what it would have found we are about to record.
    this.forget();

    return this.queue(() => this.record(directory));
  }

  /**
   * Takes the folder as it stands to be its new state, saying nothing about it — what a watch just taken up
   * finds, and what our own write left behind. `known` is written here and in `read`, and nowhere else, so
   * every write to it stands in the queue and none of them races another.
   */
  private async record(directory: string): Promise<void> {
    if (directory !== this.followed) {
      return;
    }

    this.known = await this.fingerprint(directory);
    this.arm(directory);
    this.sweep(directory);
  }

  /** Debounce: several fs events for one change trigger one read after PROJECT_WATCH_SETTLE_MS of quiet. */
  private settle(directory: string, isSweep = false): void {
    this.forget();
    this.settling = setTimeout(() => {
      this.settling = null;
      void this.tell(directory, isSweep);
    }, PROJECT_WATCH_SETTLE_MS);
    this.settling.unref();
  }

  /**
   * Reads the folder and says so if it moved. A sweep asks for no sweep of its own: one read after a watch is
   * taken up covers the gap, a second would question a quiet folder forever. Anything an event asks for does,
   * so the folder taken up afresh is read once more after it next goes quiet.
   */
  private async tell(directory: string, isSweep = false): Promise<void> {
    return this.queue(() => this.read(directory, isSweep));
  }

  /** The read itself, which only ever runs alone. */
  private async read(directory: string, isSweep: boolean): Promise<void> {
    if (directory !== this.followed) {
      return;
    }

    const fingerprint = await this.fingerprint(directory);

    this.arm(directory);

    if (fingerprint !== this.known) {
      this.known = fingerprint;
      this.voice.changed(directory);
    }

    if (!isSweep) {
      this.sweep(directory);
    }
  }

  /** Stands the work after whatever read is already going, so the two never overlap. */
  private queue(work: () => Promise<void>): Promise<void> {
    this.reading = this.reading.then(work);

    return this.reading;
  }

  /**
   * One read the watch owes itself a settle after it was taken up, which no event will ever ask for.
   *
   * Starting to listen is not instant, and a change that lands between opening the watch and delivering from it
   * is never queued for anybody — no waiting brings it. The folder is taken up afresh after every change, so that
   * moment comes round again and again, and reading once, unasked, is the only thing that notices.
   *
   * It asks through the settle and never reads by itself. A read of its own would land whenever the timer says,
   * and a folder somebody is writing into is read mid-write: a file truncated and not yet filled is a state
   * nobody meant, and it differs from both the old text and the new — so it is said to have changed, and said
   * again when the writing finishes. Going through the settle, it waits for the quiet like every other read,
   * and an event that arrives meanwhile simply takes the read over.
   */
  private sweep(directory: string): void {
    this.sweeping = setTimeout(() => {
      this.sweeping = null;
      this.settle(directory, true);
    }, PROJECT_WATCH_SETTLE_MS);
    this.sweeping.unref();
  }

  /**
   * Takes the watch up on the folder again: a rename leaves an inotify watch on a dead inode, and a second change
   * after one must still be heard.
   *
   * The new watch is opened **before** the old one is closed — between a close and an open the folder is watched
   * by nobody, and that is exactly when an editor or a `git pull` is most likely to write again.
   */
  private arm(directory: string): void {
    const standing = this.watcher;

    this.watcher = watch(
      directory,
      {
        recursive: true,
      },
      () => this.settle(directory),
    );
    // The watch does not keep the process alive.
    this.watcher.unref();
    standing?.close();
  }

  private stop(): void {
    this.watcher?.close();
    this.watcher = null;
    this.forget();
  }

  /** Drops both reads that are owed: an event supersedes the sweep, and a watch put down owes nothing at all. */
  private forget(): void {
    if (this.settling !== null) {
      clearTimeout(this.settling);
      this.settling = null;
    }

    if (this.sweeping !== null) {
      clearTimeout(this.sweeping);
      this.sweeping = null;
    }
  }

  /** The whole project as one string: the config file, then every part file it could name, each under its path. */
  private async fingerprint(directory: string): Promise<string> {
    const pieces = [PROJECT_FILE_NAME, await this.text(this.filePath(directory))];

    for (const folder of [...Object.values(PROJECT_PART_DIRECTORIES), PROMPTS_DIRECTORY_NAME]) {
      const at = path.join(directory, folder);
      const pattern = folder === PROMPTS_DIRECTORY_NAME ? PROMPT_FILE_PATTERN : PART_FILE_PATTERN;

      for (const name of await this.names(at, pattern)) {
        pieces.push(`${folder}/${name}`, await this.text(path.join(at, name)));
      }
    }

    return pieces.join("\0");
  }

  /** The files in one part folder the app itself would have written, in a settled order; a missing folder is none. */
  private async names(at: string, pattern: RegExp): Promise<string[]> {
    try {
      return (await readdir(at)).filter((name) => pattern.test(name)).sort();
    } catch {
      return [];
    }
  }

  /** A file's text; a missing file reads as "". */
  private async text(filePath: string): Promise<string> {
    try {
      return await readFile(filePath, "utf8");
    } catch {
      return "";
    }
  }

  private filePath(directory: string): string {
    return path.join(directory, PROJECT_FILE_NAME);
  }
}
