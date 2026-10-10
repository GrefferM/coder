import path from "node:path";
import {
  PROJECT_FINDER_KNOWN_LABEL,
  PROJECT_FINDER_NAME_SEPARATOR,
  PROJECT_FINDER_NONE_KNOWN_NOTE,
  PROJECT_FINDER_NONE_NOTE,
  PROJECT_FINDER_SEVERAL_NOTE,
} from "../constants";
import type { FoundProject, KnownProject, ProjectOpener } from "../interfaces";

/** Finds the project a person typed on a command line: a folder, or the name of one this machine has opened. */
export class ProjectFinder {
  constructor(private readonly projects: ProjectOpener) {}

  /** Reads the project; rejects with words the person can act on when none matches. */
  async find(wanted: string): Promise<FoundProject> {
    const directory = this.isFolder(wanted) ? path.resolve(wanted) : await this.directoryNamed(wanted);
    const read = await this.projects.open({
      directory,
    });

    return {
      directory,
      config: read.config,
    };
  }

  /** A path rather than a name: it has a separator in it, or is the folder you stand in. */
  private isFolder(wanted: string): boolean {
    return wanted === "." || wanted === ".." || wanted.includes("/") || wanted.includes(path.sep);
  }

  /** The folder of the one project that bears this name (case aside) among those this machine has opened. */
  private async directoryNamed(wanted: string): Promise<string> {
    const known = (await this.projects.findRecent()).filter((one) => one.exists);
    const same = known.filter((one) => one.name.toLowerCase() === wanted.trim().toLowerCase());

    if (same.length === 1) {
      return same[0].directory;
    }

    if (same.length > 1) {
      throw new Error(`${PROJECT_FINDER_SEVERAL_NOTE}${this.listed(same, (one) => one.directory)}`);
    }

    throw new Error(`${PROJECT_FINDER_NONE_NOTE}${wanted}. ${this.knownWords(known)}`);
  }

  private knownWords(known: KnownProject[]): string {
    return known.length === 0
      ? PROJECT_FINDER_NONE_KNOWN_NOTE
      : `${PROJECT_FINDER_KNOWN_LABEL}${this.listed(known, (one) => one.name)}`;
  }

  private listed(projects: KnownProject[], word: (one: KnownProject) => string): string {
    return projects.map(word).join(PROJECT_FINDER_NAME_SEPARATOR);
  }
}
