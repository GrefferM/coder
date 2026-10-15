import { createHash } from "node:crypto";
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
   * Reads run one at a time; two in flight would both see the change against the same old fingerprint and report it
   * twice.
   */
  private reading: Promise<void> = Promise.resolve();

  constructor(private readonly voice: ProjectVoice) {}

  async follow(directory: string): Promise<string> {
    this.stop();
    this.followed = directory;

    return this.queue(() => this.record(directory));
  }

  /** Puts the watch down: nothing is followed or remembered until `follow`. */
  unfollow(): void {
    this.stop();
    this.followed = null;
    this.known = null;
  }

  async remember(directory: string): Promise<string> {
    if (directory !== this.followed) {
      return this.fingerprint(directory);
    }

    // A read waiting on our own write has nothing to report.
    this.forget();

    return this.queue(() => this.record(directory));
  }

  async print(directory: string): Promise<string> {
    return this.fingerprint(directory);
  }

  async look(): Promise<void> {
    if (this.followed === null) {
      return;
    }

    return this.tell(this.followed, true);
  }

  /**
   * Takes the folder as it stands as the new state, silently, and gives its print; `known` is written only here and in
   * `read`, always inside the queue.
   */
  private async record(directory: string): Promise<string> {
    const print = await this.fingerprint(directory);

    if (directory === this.followed) {
      this.known = print;
      this.arm(directory);
      this.sweep(directory);
    }

    return print;
  }

  /** Debounce: events for one change trigger one read after PROJECT_WATCH_SETTLE_MS of quiet. */
  private settle(directory: string, isSweep = false): void {
    this.forget();
    this.settling = setTimeout(() => {
      this.settling = null;
      void this.tell(directory, isSweep);
    }, PROJECT_WATCH_SETTLE_MS);
    this.settling.unref();
  }

  /**
   * Reads the folder and reports if it moved. A sweep asks for no further sweep; an event's read does, so a re-armed
   * watch is read once more after quiet.
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

  /** Runs the work after any read already going; a failed one does not stop the reads after it. */
  private queue<T>(work: () => Promise<T>): Promise<T> {
    const done = this.reading.then(work);

    this.reading = done.then(
      () => undefined,
      () => undefined,
    );

    return done;
  }

  /**
   * One read owed after a watch is taken up, since a change between opening and first delivery is never queued. It goes
   * through the settle, so a half-written file is never read; an event meanwhile takes the read over.
   */
  private sweep(directory: string): void {
    this.sweeping = setTimeout(() => {
      this.sweeping = null;
      this.settle(directory, true);
    }, PROJECT_WATCH_SETTLE_MS);
    this.sweeping.unref();
  }

  /**
   * Takes the watch up on the folder again, since a rename leaves an inotify watch on a dead inode.
   *
   * The new watch opens before the old one closes, so the folder is never unwatched.
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
    this.watcher.unref();
    standing?.close();
  }

  private stop(): void {
    this.watcher?.close();
    this.watcher = null;
    this.forget();
  }

  /** Drops both owed reads: an event supersedes the sweep, and a stopped watch owes nothing. */
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

  /**
   * The whole project as one short string: the config file, then every part file it could name, each under its path,
   * hashed.
   */
  private async fingerprint(directory: string): Promise<string> {
    const pieces = [PROJECT_FILE_NAME, await this.text(this.filePath(directory))];

    for (const folder of [...Object.values(PROJECT_PART_DIRECTORIES), PROMPTS_DIRECTORY_NAME]) {
      const at = path.join(directory, folder);
      const pattern = folder === PROMPTS_DIRECTORY_NAME ? PROMPT_FILE_PATTERN : PART_FILE_PATTERN;

      for (const name of await this.names(at, pattern)) {
        pieces.push(`${folder}/${name}`, await this.text(path.join(at, name)));
      }
    }

    return createHash("sha256").update(pieces.join("\0")).digest("hex");
  }

  /** The app-written files in one part folder, in a settled order; a missing folder gives none. */
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
