import {
  RunCallEntity,
  RunEntity,
  RunHandoffEntity,
  RunQuestionEntity,
  RunStepAgentEntity,
  RunStepEntity,
  RunStepFeedEntity,
  RunStepModelEntity,
  RunStepSettingEntity,
} from "../entities";
import type { DataSource } from "typeorm";
import type { RunTables } from "../interfaces";

/** Every table the record writes to, from one connection; shared by the module and tests. */
export function runTablesOf(dataSource: DataSource): RunTables {
  return {
    runs: dataSource.getRepository(RunEntity),
    steps: dataSource.getRepository(RunStepEntity),
    calls: dataSource.getRepository(RunCallEntity),
    feeds: dataSource.getRepository(RunStepFeedEntity),
    handoffs: dataSource.getRepository(RunHandoffEntity),
    questions: dataSource.getRepository(RunQuestionEntity),
    who: dataSource.getRepository(RunStepAgentEntity),
    ran: dataSource.getRepository(RunStepModelEntity),
    given: dataSource.getRepository(RunStepSettingEntity),
  };
}
