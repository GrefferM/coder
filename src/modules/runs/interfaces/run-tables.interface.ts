import type { Repository } from "typeorm";
import type {
  RunCallEntity,
  RunEntity,
  RunHandoffEntity,
  RunMemoryEntity,
  RunQuestionAttachmentEntity,
  RunQuestionEntity,
  RunStepAgentEntity,
  RunStepEntity,
  RunStepFeedEntity,
  RunStepModelEntity,
  RunStepSettingEntity,
} from "../entities";

/** The eleven tables of one record, named so callers cannot pass them in the wrong order. */
export interface RunTables {
  runs: Repository<RunEntity>;
  steps: Repository<RunStepEntity>;
  calls: Repository<RunCallEntity>;
  feeds: Repository<RunStepFeedEntity>;
  handoffs: Repository<RunHandoffEntity>;
  /** The composer's messages, each beside the step that paid for it. */
  memories: Repository<RunMemoryEntity>;
  questions: Repository<RunQuestionEntity>;
  attachments: Repository<RunQuestionAttachmentEntity>;
  /** Who ran the step, what it ran on and what it was given; one row each beside the step. */
  who: Repository<RunStepAgentEntity>;
  ran: Repository<RunStepModelEntity>;
  given: Repository<RunStepSettingEntity>;
}
