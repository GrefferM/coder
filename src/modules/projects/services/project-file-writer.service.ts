import path from "node:path";
import { PART_FILE_EXTENSION, PART_FILE_PATTERN, PROJECT_PART_DIRECTORIES } from "../constants";
import type { ProjectAgentDto, ProjectConfigDto, ProjectModelDto, ProjectScheduleDto } from "../dto";
import { ProjectConfigSerializer } from "./project-config-serializer.service";
import { ProjectFileReader } from "./project-file-reader.service";
import { ProjectFolder } from "./project-folder.service";

/** Writes a config into its folder: changed part files, then the project file, then deletes files nothing names. */
export class ProjectFileWriter {
  constructor(
    private readonly serializer: ProjectConfigSerializer,
    private readonly folder: ProjectFolder,
    private readonly reader: ProjectFileReader,
  ) {}

  async write(projectDirectory: string, source: ProjectConfigDto): Promise<void> {
    const held = await this.reader.promptFiles(projectDirectory);
    const config = await this.serializer.toValidConfig({
      ...source,
      prompts: source.prompts.map((prompt) => ({
        ...prompt,
        file: this.folder.promptFile(prompt),
      })),
    });

    // A prompt whose file changed is moved first.
    for (const prompt of config.prompts) {
      const was = held.get(prompt.id);

      if (was !== undefined && was !== prompt.file) {
        await this.folder.moveIfThere(
          path.join(projectDirectory, was),
          this.folder.promptPath(projectDirectory, prompt),
        );
      }
    }

    for (const prompt of config.prompts) {
      await this.folder.writeIfChanged(this.folder.promptPath(projectDirectory, prompt), prompt.text);
    }

    await this.writeParts(
      projectDirectory,
      PROJECT_PART_DIRECTORIES.models,
      config.models.map((model) => [model.id, this.describedModel(model)]),
    );
    await this.writeParts(
      projectDirectory,
      PROJECT_PART_DIRECTORIES.commands,
      config.commands.map(({ id, ...described }) => [id, described]),
    );
    await this.writeParts(
      projectDirectory,
      PROJECT_PART_DIRECTORIES.servers,
      config.servers.map(({ id, ...described }) => [id, described]),
    );
    await this.writeParts(
      projectDirectory,
      PROJECT_PART_DIRECTORIES.agents,
      config.agents.map((agent) => [agent.id, this.describedAgent(agent)]),
    );
    await this.writeParts(
      projectDirectory,
      PROJECT_PART_DIRECTORIES.schedules,
      config.schedules.map((schedule) => [schedule.id, this.describedSchedule(schedule)]),
    );

    await this.folder.writeAtomically(
      this.folder.filePath(projectDirectory),
      this.serializer.text(this.indexOf(config)),
    );
    await this.forgetGonePrompts(projectDirectory, held, config);
    await this.forgetGoneParts(projectDirectory, config);
  }

  /** A model's own fields; its provider tie stays in the project file. */
  private describedModel(model: ProjectModelDto): Record<string, unknown> {
    return {
      title: model.title,
      kind: model.kind,
      inputPrice: model.inputPrice,
      outputPrice: model.outputPrice,
      contextCeiling: model.contextCeiling,
      answerCeiling: model.answerCeiling,
    };
  }

  /** An agent's own fields; its ties (modelId, promptId, tools) stay in the project file. */
  private describedAgent(agent: ProjectAgentDto): Record<string, unknown> {
    return {
      name: agent.name,
      purpose: agent.purpose,
      color: agent.color,
      isActive: agent.isActive,
      waitsForAll: agent.waitsForAll,
      memory: agent.memory,
      x: agent.x,
      y: agent.y,
      maxCalls: agent.maxCalls,
      temperature: agent.temperature,
      compressAt: agent.compressAt,
      compressTo: agent.compressTo,
    };
  }

  /** A schedule's own fields; its agent tie stays in the project file. */
  private describedSchedule(schedule: ProjectScheduleDto): Record<string, unknown> {
    return {
      task: schedule.task,
      everyMinutes: schedule.everyMinutes,
    };
  }

  /** Writes each part of one kind to its own file; a file already holding that text is skipped. */
  private async writeParts(
    projectDirectory: string,
    directory: string,
    parts: [string, Record<string, unknown>][],
  ): Promise<void> {
    for (const [id, described] of parts) {
      await this.folder.writeIfChanged(
        this.folder.partPath(projectDirectory, directory, id),
        this.serializer.text(described),
      );
    }
  }

  /** The project file: version, name, one reference per part, and every tie (agent ties, links, schedules' agents). */
  private indexOf(config: ProjectConfigDto): Record<string, unknown> {
    return {
      version: config.version,
      name: config.name,
      models: config.models.map((model) => ({
        ...this.referenceTo(PROJECT_PART_DIRECTORIES.models, model.id),
        provider: model.provider,
      })),
      prompts: config.prompts.map(({ id, name, file }) => ({
        id,
        name,
        file,
      })),
      commands: config.commands.map((command) => this.referenceTo(PROJECT_PART_DIRECTORIES.commands, command.id)),
      servers: config.servers.map((server) => this.referenceTo(PROJECT_PART_DIRECTORIES.servers, server.id)),
      agents: config.agents.map((agent) => ({
        ...this.referenceTo(PROJECT_PART_DIRECTORIES.agents, agent.id),
        modelId: agent.modelId,
        promptId: agent.promptId,
        tools: agent.tools,
      })),
      links: config.links,
      schedules: config.schedules.map((schedule) => ({
        ...this.referenceTo(PROJECT_PART_DIRECTORIES.schedules, schedule.id),
        agentId: schedule.agentId,
      })),
      speech: {
        listenModelId: config.speech.listenModelId,
      },
    };
  }

  private referenceTo(directory: string, id: string): Record<string, unknown> {
    return {
      id,
      file: this.folder.partFile(directory, id),
    };
  }

  /** Deletes files of removed parts; names not matching PART_FILE_PATTERN are kept. */
  private async forgetGoneParts(projectDirectory: string, config: ProjectConfigDto): Promise<void> {
    const standing: [string, { id: string }[]][] = [
      [PROJECT_PART_DIRECTORIES.models, config.models],
      [PROJECT_PART_DIRECTORIES.commands, config.commands],
      [PROJECT_PART_DIRECTORIES.servers, config.servers],
      [PROJECT_PART_DIRECTORIES.agents, config.agents],
      [PROJECT_PART_DIRECTORIES.schedules, config.schedules],
    ];

    for (const [directory, parts] of standing) {
      const kept = new Set(parts.map((part) => `${part.id}${PART_FILE_EXTENSION}`));

      for (const name of await this.folder.namesIn(path.join(projectDirectory, directory))) {
        if (PART_FILE_PATTERN.test(name) && !kept.has(name)) {
          await this.folder.forget(path.join(projectDirectory, directory, name));
        }
      }
    }
  }

  /** Deletes prompt files present before this write and absent from it. */
  private async forgetGonePrompts(
    projectDirectory: string,
    held: Map<string, string>,
    config: ProjectConfigDto,
  ): Promise<void> {
    for (const [id, file] of held) {
      if (!config.prompts.some((prompt) => prompt.id === id)) {
        await this.folder.forget(path.join(projectDirectory, file));
      }
    }
  }
}
