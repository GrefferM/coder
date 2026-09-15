import { access, mkdir, readdir, rename, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { PART_FILE_EXTENSION, PROJECT_FILE_NAME, PROMPTS_DIRECTORY_NAME, PROMPT_FILE_EXTENSION } from "../constants";
import type { ProjectPromptDto } from "../dto";

/** Where a project's files lie, and the only ways the module touches them. */
export class ProjectFolder {
  filePath(projectDirectory: string): string {
    return path.join(projectDirectory, PROJECT_FILE_NAME);
  }

  promptPath(projectDirectory: string, prompt: ProjectPromptDto): string {
    return path.join(projectDirectory, prompt.file);
  }

  /** Part file path, e.g. `agents/<id>.yaml`. */
  partPath(projectDirectory: string, directory: string, id: string): string {
    return path.join(projectDirectory, this.partFile(directory, id));
  }

  partFile(directory: string, id: string): string {
    return path.join(directory, `${id}${PART_FILE_EXTENSION}`);
  }

  /** Where a prompt's body lives: `prompts/<id>.md`. */
  promptFile(prompt: ProjectPromptDto): string {
    return path.join(PROMPTS_DIRECTORY_NAME, `${prompt.id}${PROMPT_FILE_EXTENSION}`);
  }

  /** Whether the file is there at all; nothing is read to answer it. */
  async isThere(filePath: string): Promise<boolean> {
    try {
      await access(filePath);

      return true;
    } catch {
      return false;
    }
  }

  /** A file's text; nothing at all where it cannot be read, which is not the same as an empty one. */
  async textOf(filePath: string): Promise<string | null> {
    try {
      return await readFile(filePath, "utf8");
    } catch {
      return null;
    }
  }

  /** Directory names; a missing directory reads as empty. */
  async namesIn(directory: string): Promise<string[]> {
    try {
      return await readdir(directory);
    } catch {
      return [];
    }
  }

  /** Renames if the source exists; a missing source is ignored. */
  async moveIfThere(from: string, to: string): Promise<void> {
    try {
      await mkdir(path.dirname(to), {
        recursive: true,
      });
      await rename(from, to);
    } catch {
      // Missing source: the subsequent write creates the body at the new path.
    }
  }

  /** Writes the file unless it already holds exactly this text. */
  async writeIfChanged(filePath: string, contents: string): Promise<void> {
    if ((await this.textOf(filePath)) === contents) {
      return;
    }

    await this.writeAtomically(filePath, contents);
  }

  /** A torn write leaves the previous file whole. */
  async writeAtomically(filePath: string, contents: string): Promise<void> {
    const temporaryPath = `${filePath}.tmp`;

    await mkdir(path.dirname(filePath), {
      recursive: true,
    });
    await writeFile(temporaryPath, contents, "utf8");
    await rename(temporaryPath, filePath);
  }

  async forget(filePath: string): Promise<void> {
    await rm(filePath, {
      force: true,
    });
  }
}
