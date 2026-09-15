import { readFile } from "node:fs/promises";
import path from "node:path";
import { AGENT_SKELETON, AGENT_SKELETON_STEP_PX } from "../constants";
import type { FolderContents } from "../interfaces";
import type { ProjectConfigDto } from "../dto";
import { ProjectConfigSerializer } from "./project-config-serializer.service";
import { ProjectFolder } from "./project-folder.service";

/** One project folder read into a config: the project file, and each part's own file merged under its entry. */
export class ProjectFileReader {
  constructor(
    private readonly serializer: ProjectConfigSerializer,
    private readonly folder: ProjectFolder,
  ) {}

  async read(projectDirectory: string): Promise<ProjectConfigDto> {
    // The one read that must not swallow its failure: a folder with no project file is the caller's to answer for.
    const source = this.serializer.toSource(await readFile(this.folder.filePath(projectDirectory), "utf8"));
    const config = await this.serializer.toValidConfig({
      ...source,
      models: await this.readParts(projectDirectory, source.models),
      commands: await this.readParts(projectDirectory, source.commands),
      servers: await this.readParts(projectDirectory, source.servers),
      agents: await this.readParts(projectDirectory, source.agents, AGENT_SKELETON),
    });

    // A prompt whose own file is gone leaves the library with the rest: what is gone is not restored, and the agent
    // that names it says so where it names it. An empty file is a different thing — that prompt is written, and empty.
    const written = [];

    for (const prompt of config.prompts) {
      const text = await this.folder.textOf(this.folder.promptPath(projectDirectory, prompt));

      if (text !== null) {
        prompt.text = text;
        written.push(prompt);
      }
    }

    config.prompts = written;

    return config;
  }

  /** The counts a row and the new-project form show; a folder with no project is named by its basename. */
  async glance(projectDirectory: string): Promise<FolderContents> {
    // Counts come from the references alone; no part file is opened and nothing is validated.
    const text = await this.folder.textOf(this.folder.filePath(projectDirectory));

    if (text === null) {
      return {
        hasProject: false,
        name: path.basename(projectDirectory),
        agentCount: 0,
        linkCount: 0,
        promptCount: 0,
      };
    }

    const source = this.serializer.toSource(text);

    return {
      hasProject: true,
      name: typeof source.name === "string" ? source.name : path.basename(projectDirectory),
      agentCount: this.countOf(source.agents),
      linkCount: this.countOf(source.links),
      promptCount: this.countOf(source.prompts),
    };
  }

  /** Whether the folder holds a project at all. */
  async exists(projectDirectory: string): Promise<boolean> {
    return this.folder.isThere(this.folder.filePath(projectDirectory));
  }

  /** Prompt id → file map as the project file has it, read from the references alone. */
  async promptFiles(projectDirectory: string): Promise<Map<string, string>> {
    const text = await this.folder.textOf(this.folder.filePath(projectDirectory));

    if (text === null) {
      // No readable project file: nothing to move.
      return new Map();
    }

    const source = this.serializer.toSource(text);
    const prompts = Array.isArray(source.prompts) ? <Record<string, unknown>[]>source.prompts : [];

    return new Map(
      prompts
        .filter((prompt) => typeof prompt.id === "string" && typeof prompt.file === "string")
        .map((prompt) => [<string>prompt.id, <string>prompt.file]),
    );
  }

  /**
   * Merges each part's own file under its project-file entry; an entry with no `file` field is taken as-is. A part
   * whose file is gone is left out, unless a skeleton is given to stand in its place.
   */
  private async readParts(
    projectDirectory: string,
    source: unknown,
    skeleton: Record<string, unknown> | null = null,
  ): Promise<Record<string, unknown>[]> {
    if (!Array.isArray(source)) {
      return [];
    }

    const parts: Record<string, unknown>[] = [];
    let restored = 0;

    for (const entry of <Record<string, unknown>[]>source) {
      if (typeof entry.file !== "string") {
        parts.push(entry);

        continue;
      }

      const part = await this.partSource(projectDirectory, entry.file);

      if (part === null) {
        // A part the catalogue holds is simply left out; only an agent, whose sphere the lines are drawn to, stands in.
        if (skeleton !== null) {
          parts.push({
            ...this.restoredAgent(skeleton, restored++),
            ...entry,
          });
        }

        continue;
      }

      parts.push({
        ...part,
        ...entry,
      });
    }

    return parts;
  }

  /** Reads one part's own file; nothing at all where it cannot be read. */
  private async partSource(projectDirectory: string, file: string): Promise<Record<string, unknown> | null> {
    const text = await this.folder.textOf(path.join(projectDirectory, file));

    return text === null ? null : this.serializer.partSource(text);
  }

  /** An agent whose own file is gone: its place went with the file, so restored ones are laid out in a row. */
  private restoredAgent(skeleton: Record<string, unknown>, place: number): Record<string, unknown> {
    return {
      ...skeleton,
      x: AGENT_SKELETON_STEP_PX * place,
      y: 0,
    };
  }

  private countOf(source: unknown): number {
    return Array.isArray(source) ? source.length : 0;
  }
}
