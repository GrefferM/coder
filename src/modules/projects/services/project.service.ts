import { Repository } from "typeorm";
import { ProjectEntryEntity } from "../entities";
import {
  CreateProjectDto,
  ForgetProjectDto,
  ProjectConfigDto,
  OpenProjectDto,
  RememberProjectViewDto,
  SaveProjectDto,
} from "../dto";
import { PROJECT_ALREADY_THERE, PROJECT_CONFIG_VERSION, RECENT_PROJECTS_LIMIT } from "../constants";
import { PROJECT_NOT_FOUND } from "../../../contracts";
import { FolderContents, KnownProject, ProjectFileStore, ProjectHistory, ProjectWatch } from "../interfaces";
import { Refusal } from "../../../utils/refusals";

/** Opens and creates projects and keeps this machine's list of them; the config lives in the project's folder. */
export class ProjectService {
  /** The save running in each project directory, with the next one chained onto it. */
  private readonly saving = new Map<string, Promise<void>>();

  constructor(
    private readonly projectEntryRepository: Repository<ProjectEntryEntity>,
    private readonly projectFileStore: ProjectFileStore,
    private readonly projectWatch: ProjectWatch,
    private readonly projectHistory: ProjectHistory,
  ) {}

  /** Writes an empty project into the folder and remembers it; a folder that holds one already is refused. */
  async create(payload: CreateProjectDto): Promise<ProjectConfigDto> {
    const { directory, name } = payload;

    if (await this.projectFileStore.exists(directory)) {
      throw new Refusal(PROJECT_ALREADY_THERE);
    }

    await this.projectFileStore.write(directory, this.emptyConfig(name));
    await this.remember(directory, name);
    await this.projectWatch.follow(directory);

    // What the folder now holds, not what was handed to it: the file is the truth.
    return this.projectFileStore.read(directory);
  }

  /** What the chosen folder holds. */
  async look(payload: OpenProjectDto): Promise<FolderContents> {
    return this.projectFileStore.glance(payload.directory);
  }

  /** Opens the chosen folder, making it a project if it is not one yet. */
  async openOrCreate(payload: OpenProjectDto): Promise<ProjectConfigDto> {
    const { directory } = payload;

    if (await this.projectFileStore.exists(directory)) {
      return this.open(payload);
    }

    return this.create({
      directory,
      name: this.folderName(directory),
    });
  }

  /** Reads the project in the folder and moves it to the top of the recent list. */
  async open(payload: OpenProjectDto): Promise<ProjectConfigDto> {
    const { directory } = payload;

    if (!(await this.projectFileStore.exists(directory))) {
      throw new Refusal(PROJECT_NOT_FOUND);
    }

    const config = await this.projectFileStore.read(directory);

    await this.remember(directory, config.name);
    await this.projectWatch.follow(directory);

    return config;
  }

  /**
   * The open project is put down: nothing is followed until a project is opened again. A folder nobody has open
   * is a folder nobody is told about, so the watch goes down with the project rather than outliving it.
   */
  close(): void {
    this.projectWatch.unfollow();
  }

  /** Writes the whole config back to the project's folder; saves of one folder run one after another. */
  async save(payload: SaveProjectDto): Promise<void> {
    const { directory, config } = payload;
    const standing = this.saving.get(directory) ?? Promise.resolve();
    const saving = standing.then(() => this.writeAndRemember(directory, config));
    // The chain carries on past a failed save, which is answered to its own caller alone.
    const settled = saving.catch(() => undefined);

    this.saving.set(directory, settled);

    try {
      await saving;
    } finally {
      this.forgetSaving(directory, settled);
    }
  }

  /** Every project this machine has opened, most recent first, each saying whether it is still there. */
  async findRecent(): Promise<KnownProject[]> {
    const entries = await this.projectEntryRepository.find({
      order: {
        openedAt: "DESC",
      },
      take: RECENT_PROJECTS_LIMIT,
    });

    return Promise.all(
      entries.map(async (entry) => {
        const held = await this.projectFileStore.glance(entry.directory);

        return {
          id: entry.id,
          name: entry.name,
          directory: entry.directory,
          openedAt: entry.openedAt,
          exists: held.hasProject,
          agentCount: held.agentCount,
        };
      }),
    );
  }

  /** Where this machine was looking in that folder last time, or nothing if it has never been noted. */
  async viewOf(payload: OpenProjectDto): Promise<string | null> {
    const entry = await this.projectEntryRepository.findOneBy({
      directory: payload.directory,
    });

    return entry?.view ?? null;
  }

  /** Notes where this machine is looking. A folder this machine does not know is not remembered for. */
  async rememberView(payload: RememberProjectViewDto): Promise<void> {
    const entry = await this.projectEntryRepository.findOneBy({
      directory: payload.directory,
    });

    if (!entry) {
      return;
    }

    await this.projectEntryRepository.update(entry.id, {
      view: payload.view,
    });
  }

  /** Hard-deletes the project's entry and its deletion history; the folder itself is left alone. */
  async forget(payload: ForgetProjectDto): Promise<void> {
    const { directory } = payload;
    const entry = await this.projectEntryRepository.findOneBy({
      directory,
    });

    if (entry) {
      await this.projectEntryRepository.remove(entry);
    }

    await this.projectHistory.forgetProject(directory);
  }

  /** One save: the folder written, then what now stands in it taken as the app's own. */
  private async writeAndRemember(directory: string, config: ProjectConfigDto): Promise<void> {
    await this.projectFileStore.write(directory, config);
    await this.projectWatch.remember(directory);
  }

  /** Drops a folder's chain once its last save is done, so nothing is held for a folder nobody is saving. */
  private forgetSaving(directory: string, settled: Promise<void>): void {
    if (this.saving.get(directory) === settled) {
      this.saving.delete(directory);
    }
  }

  /** The unique index on directory covers soft-deleted rows too. */
  private async remember(directory: string, name: string): Promise<ProjectEntryEntity> {
    const existing = await this.projectEntryRepository.findOne({
      where: {
        directory,
      },
      withDeleted: true,
    });

    if (existing) {
      await this.projectEntryRepository.update(existing.id, {
        name,
        openedAt: new Date(),
      });
      // Reopening a forgotten folder restores the soft-deleted row.
      await this.projectEntryRepository.restore(existing.id);

      return existing;
    }

    const entry = this.projectEntryRepository.create({
      name,
      directory,
      openedAt: new Date(),
    });

    return this.projectEntryRepository.save(entry);
  }

  /** The folder's last path segment, used as the new project's name. */
  private folderName(directory: string): string {
    return directory.split("/").filter(Boolean).at(-1) ?? directory;
  }

  private emptyConfig(name: string): ProjectConfigDto {
    const config = new ProjectConfigDto();

    config.version = PROJECT_CONFIG_VERSION;
    config.name = name;
    config.models = [];
    config.prompts = [];
    config.commands = [];
    config.agents = [];
    config.links = [];

    return config;
  }
}
