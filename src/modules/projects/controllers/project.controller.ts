import { Validate } from "../../../utils/dto-validation";
import { ProjectService } from "../services";
import {
  CreateProjectDto,
  ForgetProjectDto,
  ProjectConfigDto,
  OpenProjectDto,
  RememberProjectViewDto,
  SaveProjectDto,
} from "../dto";
import { FolderContents, KnownProject } from "../interfaces";

/** The entry point to projects. */
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Validate()
  async create(payload: CreateProjectDto): Promise<ProjectConfigDto> {
    return this.projectService.create(payload);
  }

  @Validate()
  async open(payload: OpenProjectDto): Promise<ProjectConfigDto> {
    return this.projectService.open(payload);
  }

  @Validate()
  async look(payload: OpenProjectDto): Promise<FolderContents> {
    return this.projectService.look(payload);
  }

  @Validate()
  async openOrCreate(payload: OpenProjectDto): Promise<ProjectConfigDto> {
    return this.projectService.openOrCreate(payload);
  }

  /** Nothing is handed over: the one open project is what is put down. */
  async close(): Promise<void> {
    this.projectService.close();
  }

  @Validate()
  async forget(payload: ForgetProjectDto): Promise<void> {
    return this.projectService.forget(payload);
  }

  @Validate()
  async save(payload: SaveProjectDto): Promise<void> {
    return this.projectService.save(payload);
  }

  @Validate()
  async viewOf(payload: OpenProjectDto): Promise<string | null> {
    return this.projectService.viewOf(payload);
  }

  @Validate()
  async rememberView(payload: RememberProjectViewDto): Promise<void> {
    return this.projectService.rememberView(payload);
  }

  async findRecent(): Promise<KnownProject[]> {
    return this.projectService.findRecent();
  }
}
