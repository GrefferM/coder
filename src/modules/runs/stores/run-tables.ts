import {
  RunCallEntity,
  RunEntity,
  RunHandoffEntity,
  RunQuestionAttachmentEntity,
  RunQuestionEntity,
  RunStepAgentEntity,
  RunStepEntity,
  RunStepFeedEntity,
  RunStepModelEntity,
  RunStepSettingEntity,
} from "../entities";
import type { DataSource, EntityManager } from "typeorm";
import type { RunTables } from "../interfaces";

/** Every table the record writes to, from one connection or one transaction; shared by the module and tests. */
export function runTablesOf(dataSource: DataSource | EntityManager): RunTables {
  return {
    runs: dataSource.getRepository(RunEntity),
    steps: dataSource.getRepository(RunStepEntity),
    calls: dataSource.getRepository(RunCallEntity),
    feeds: dataSource.getRepository(RunStepFeedEntity),
    handoffs: dataSource.getRepository(RunHandoffEntity),
    questions: dataSource.getRepository(RunQuestionEntity),
    attachments: dataSource.getRepository(RunQuestionAttachmentEntity),
    who: dataSource.getRepository(RunStepAgentEntity),
    ran: dataSource.getRepository(RunStepModelEntity),
    given: dataSource.getRepository(RunStepSettingEntity),
  };
}
