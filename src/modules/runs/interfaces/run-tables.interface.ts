import type { Repository } from "typeorm";
import type {
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

/** The nine tables one record is spread over, each named — so no caller can hand them over in the wrong order. */
export interface RunTables {
  runs: Repository<RunEntity>;
  steps: Repository<RunStepEntity>;
  calls: Repository<RunCallEntity>;
  feeds: Repository<RunStepFeedEntity>;
  handoffs: Repository<RunHandoffEntity>;
  questions: Repository<RunQuestionEntity>;
  /** Who ran the step, what it ran on, and what it was given — one row each, beside the step. */
  who: Repository<RunStepAgentEntity>;
  ran: Repository<RunStepModelEntity>;
  given: Repository<RunStepSettingEntity>;
}
