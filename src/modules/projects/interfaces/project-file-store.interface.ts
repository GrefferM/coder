import type { ProjectConfigDto } from "../dto";
import type { FolderContents } from "../../../contracts/project";

/** What `ProjectService` needs from the filesystem. */
export interface ProjectFileStore {
  read(projectDirectory: string): Promise<ProjectConfigDto>;
  glance(projectDirectory: string): Promise<FolderContents>;
  write(projectDirectory: string, config: ProjectConfigDto): Promise<void>;
  exists(projectDirectory: string): Promise<boolean>;
}
