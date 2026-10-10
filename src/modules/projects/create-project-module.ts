import type { DataSource } from "typeorm";
import { DeletionController, ProjectController } from "./controllers";
import {
  DeletionService,
  ProjectConfigSerializer,
  ProjectFileReader,
  ProjectFileService,
  ProjectFileWriter,
  ProjectFinder,
  ProjectFolder,
  ProjectService,
  ProjectWatchService,
} from "./services";
import { DeletionEntity, ProjectEntryEntity } from "./entities";
import type { ProjectModule, ProjectVoice } from "./interfaces";

export function createProjectModule(dataSource: DataSource, voice: ProjectVoice): ProjectModule {
  const projectEntryRepository = dataSource.getRepository(ProjectEntryEntity);
  const serializer = new ProjectConfigSerializer();
  const folder = new ProjectFolder();
  const projectFileReader = new ProjectFileReader(serializer, folder);
  const projectFileWriter = new ProjectFileWriter(serializer, folder, projectFileReader);
  const projectFileService = new ProjectFileService(projectFileReader, projectFileWriter);
  const projectWatchService = new ProjectWatchService(voice);
  const deletionService = new DeletionService(dataSource.getRepository(DeletionEntity));
  const projectService = new ProjectService(
    projectEntryRepository,
    projectFileService,
    projectWatchService,
    deletionService,
  );
  const projectController = new ProjectController(projectService);

  return {
    controller: projectController,
    deletionController: new DeletionController(deletionService),
    watch: projectWatchService,
    finder: new ProjectFinder(projectService),
  };
}
