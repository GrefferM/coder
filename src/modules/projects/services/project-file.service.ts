import type { FolderContents } from "../interfaces";
import type { ProjectConfigDto } from "../dto";
import { ProjectFileReader } from "./project-file-reader.service";
import { ProjectFileWriter } from "./project-file-writer.service";

/**
 * The one door `ProjectService` asks the folder through: reading merges part files under their entries, writing takes
 * them apart, both over one `ProjectFolder`.
 */
export class ProjectFileService {
  constructor(
    private readonly reader: ProjectFileReader,
    private readonly writer: ProjectFileWriter,
  ) {}

  async read(projectDirectory: string): Promise<ProjectConfigDto> {
    return this.reader.read(projectDirectory);
  }

  async glance(projectDirectory: string): Promise<FolderContents> {
    return this.reader.glance(projectDirectory);
  }

  async exists(projectDirectory: string): Promise<boolean> {
    return this.reader.exists(projectDirectory);
  }

  async write(projectDirectory: string, config: ProjectConfigDto): Promise<void> {
    await this.writer.write(projectDirectory, config);
  }
}
