import "reflect-metadata";
import path from "node:path";
import { DataSource } from "typeorm";
import { DeletionEntity, ProjectEntryEntity } from "./projects";
import { McpDroppedServerEntity, McpServerConsentEntity, McpServerLookEntity } from "./mcp";
import {
  RunCallEntity,
  RunEntity,
  RunHandoffEntity,
  RunMemoryEntity,
  RunQuestionAttachmentEntity,
  RunQuestionEntity,
  RunStepAgentEntity,
  RunStepEntity,
  RunStepModelEntity,
  RunStepSettingEntity,
  RunStepFeedEntity,
} from "./runs";
import { DATA_SOURCE_DATABASE_FILE_NAME } from "./constants";

export const MODULES_ENTITIES = [
  ProjectEntryEntity,
  DeletionEntity,
  McpServerLookEntity,
  McpDroppedServerEntity,
  McpServerConsentEntity,
  RunEntity,
  RunStepEntity,
  RunCallEntity,
  RunStepFeedEntity,
  RunHandoffEntity,
  RunMemoryEntity,
  RunQuestionEntity,
  RunQuestionAttachmentEntity,
  RunStepAgentEntity,
  RunStepModelEntity,
  RunStepSettingEntity,
];

/** Returned not initialized. */
export function createDataSource(databaseDirectory: string): DataSource {
  return new DataSource({
    type: "better-sqlite3",
    database: path.join(databaseDirectory, DATA_SOURCE_DATABASE_FILE_NAME),
    entities: MODULES_ENTITIES,
    migrations: [path.join(__dirname, "migrations", "*.ts")],
    synchronize: false,
  });
}
