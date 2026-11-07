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
import { PROJECT_CHANGED_ON_DISK, PROJECT_NOT_FOUND } from "../../../contracts";
import {
  FolderContents,
  KnownProject,
  ProjectFileStore,
  ProjectHistory,
  ProjectRead,
  ProjectWatch,
} from "../interfaces";
import { Refusal } from "../../../utils/refusals";

/** Opens and creates projects and keeps this machine's list; the config lives in the project's folder. */
export class ProjectService {
  /** The save running in each project directory, with the next chained onto it. */
  private readonly saving = new Map<string, Promise<void>>();
  /**
   * What each of the app's own saves left in the folder, by the print it was made from; a save from an older reading
   * stands on these, since the folder moved only by the app's own hand.
   */
  private readonly savedFrom = new Map<string, string>();

  constructor(
    private readonly projectEntryRepository: Repository<ProjectEntryEntity>,
    private readonly projectFileStore: ProjectFileStore,
    private readonly projectWatch: ProjectWatch,
    private readonly projectHistory: ProjectHistory,
  ) {}

  /** Writes an empty project into the folder and remembers it; a folder already holding one is refused. */
  async create(payload: CreateProjectDto): Promise<ProjectRead> {
    const { directory, name } = payload;

    if (await this.projectFileStore.exists(directory)) {
      throw new Refusal(PROJECT_ALREADY_THERE);
    }

    await this.projectFileStore.write(directory, this.emptyConfig(name));
    await this.remember(directory, name);

    // Returns what the folder holds, not what was handed in.
    return this.followed(directory);
  }

  async look(payload: OpenProjectDto): Promise<FolderContents> {
    return this.projectFileStore.glance(payload.directory);
  }

  async openOrCreate(payload: OpenProjectDto): Promise<ProjectRead> {
    const { directory } = payload;

    if (await this.projectFileStore.exists(directory)) {
      return this.open(payload);
    }

    return this.create({
      directory,
      name: this.folderName(directory),
    });
  }

  /** Reads the folder's project and moves it to the top of the recent list. */
  async open(payload: OpenProjectDto): Promise<ProjectRead> {
    const { directory } = payload;

    if (!(await this.projectFileStore.exists(directory))) {
      throw new Refusal(PROJECT_NOT_FOUND);
    }

    const read = await this.followed(directory);

    await this.remember(directory, read.config.name);

    return read;
  }

  /** Closes the open project; the watch goes down with it. */
  close(): void {
    this.projectWatch.unfollow();
  }

  /**
   * Writes the whole config to the project's folder and gives the new print; saves of one folder run in sequence. A
   * save made from a reading the folder has moved on from is refused, rather than undoing what changed.
   */
  async save(payload: SaveProjectDto): Promise<string> {
    const { directory, config, basis } = payload;
    const standing = this.saving.get(directory) ?? Promise.resolve();
    const saving = standing.then(() => this.writeAndRemember(directory, config, basis));
    // The chain continues past a failed save, which is reported to its own caller only.
    const settled = saving.then(
      () => undefined,
      () => undefined,
    );

    this.saving.set(directory, settled);

    try {
      return await saving;
    } finally {
      this.forgetSaving(directory, settled);
    }
  }

  /** The `RECENT_PROJECTS_LIMIT` last opened projects, most recent first, each with whether it still exists. */
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

  /** Last view in that folder, or null if never noted. */
  async viewOf(payload: OpenProjectDto): Promise<string | null> {
    const entry = await this.projectEntryRepository.findOneBy({
      directory: payload.directory,
    });

    return entry?.view ?? null;
  }

  /** Notes where this machine is looking; an unknown folder is ignored. */
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

  /** Hard-deletes the project's entry and deletion history; the folder is untouched. */
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

  /**
   * One save: checks the folder still holds the reading, writes it, then takes what stands in it as the app's own. A
   * folder moved on is said to the screen, which reads it again.
   */
  private async writeAndRemember(directory: string, config: ProjectConfigDto, basis: string): Promise<string> {
    if (!this.isStillHeld(await this.projectWatch.print(directory), basis)) {
      void this.projectWatch.look();

      throw new Refusal(PROJECT_CHANGED_ON_DISK);
    }

    await this.projectFileStore.write(directory, config);

    const print = await this.projectWatch.remember(directory);

    this.savedFrom.set(basis, print);

    return print;
  }

  /** Whether the folder holds the reading, or only what the app's own saves made of it since. */
  private isStillHeld(print: string, basis: string): boolean {
    const passed = new Set<string>();
    let reading = basis;

    while (reading !== print && !passed.has(reading)) {
      passed.add(reading);

      const next = this.savedFrom.get(reading);

      if (next === undefined) {
        return false;
      }

      reading = next;
    }

    return reading === print;
  }

  /** Follows the folder and reads it; the print is taken first, so a change in between makes a save refused, not lost. */
  private async followed(directory: string): Promise<ProjectRead> {
    const print = await this.projectWatch.follow(directory);

    return {
      config: await this.projectFileStore.read(directory),
      print,
    };
  }

  /** Drops a folder's chain once its last save is done. */
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
      // A soft-deleted row is restored; `forget` hard-deletes, so nothing here soft-deletes one.
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

  /** The folder's last path segment, the new project's name. */
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
    config.schedules = [];

    return config;
  }
}
