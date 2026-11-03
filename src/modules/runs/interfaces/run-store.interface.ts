import type { CallSource } from "../../../contracts";
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

/** A run as opened: the flow's own facts, before any question or step. */
export interface NewRun {
  directory: string;
  startedByAgentId: string;
  startedByAgentName: string;
  startedByAgentColor: string;
  startedAt: Date;
}

/** One question of a flow, in the place it was asked. */
export interface NewQuestion {
  id: string;
  place: number;
  asked: string;
  askedAt: Date;
  /** Whom it is put to, given with the question. */
  askedAgentId: string;
  askedAgentName: string;
  runId: string;
}

/** One file or folder sent with a question, in the place it was glued in. */
export interface NewAttachment {
  place: number;
  path: string;
  name: string;
  kind: string;
  text: string;
  /** The paths that went in as base64, as JSON. */
  binaries: string;
  questionId: string;
}

/** One finished step of a walk; what stands beside it is written separately. */
export interface NewStep {
  place: number;
  walkId: string;
  questionId: string;
  asked: string;
  said: string;
  state: string;
  /** The server a `noConsent` turn waited on, by id; null for every other end. */
  waitsFor: string | null;
  inputTokens: number;
  outputTokens: number;
  money: number | null;
  startedAt: Date;
  endedAt: Date;
  runId: string;
}

/** Who the turn was, as they stood the moment it ran. */
export interface NewWho {
  agentId: string;
  name: string;
  color: string;
  stepId: string;
}

/** The model the turn ran on, with its prices and ceilings then. */
export interface NewRan {
  modelId: string;
  title: string;
  providerId: string;
  inputPrice: number | null;
  outputPrice: number | null;
  contextCeiling: number | null;
  answerCeiling: number | null;
  stepId: string;
}

/** What the turn was given: its prompt and own numbers, frozen beside the step. */
export interface NewGiven {
  promptId: string | null;
  prompt: string;
  temperature: number | null;
  maxCalls: number | null;
  memoryLength: number;
  stepId: string;
}

/** What the composer wrote for a memory, with what it used; kept beside the step that paid for it. */
export interface NewMemory {
  agentId: string;
  /** The question a shared memory belongs to; null for the agent's own thread. */
  questionId: string | null;
  coversPlace: number;
  text: string;
  lengthBefore: number;
  lengthAfter: number;
  compressAt: number;
  compressTo: number;
  inputTokens: number;
  outputTokens: number;
  money: number | null;
  runId: string;
  stepId: string;
}

/** One call the turn made, with what it did and how it ended. */
export interface NewCall {
  /** The call's existing id; the record keeps it and mints none. */
  id: string;
  source: CallSource;
  place: number;
  name: string;
  arguments: string;
  pinned: string;
  line: string;
  output: string;
  refusal: string;
  exitCode: number | null;
  /** The server the call went to and its name then; none for a command's or an agent's call. */
  serverId: string | null;
  serverName: string | null;
  end: string;
  startedAt: Date;
  endedAt: Date;
  stepId: string;
}

/** One step's work coming into another. */
export interface NewFeed {
  place: number;
  stepId: string;
  fromStepId: string;
}

/** One handoff the turn made, with why it was not taken when it was not. */
export interface NewHandoff {
  place: number;
  toAgentId: string;
  stopReason: string | null;
  text: string;
  stepId: string;
}

/** Every question the record asks of the database, in the record's words; services use this, not TypeORM. */
export interface RunStore {
  /** The writes in `work` as one: all of them land, or none. */
  inOne<T>(work: (store: RunStore) => Promise<T>): Promise<T>;
  /** Opens a run and returns the row whose id everything under it points at. */
  openRun(run: NewRun): Promise<RunEntity>;
  runById(id: string): Promise<RunEntity | null>;
  /** Every run of one project, unordered. */
  runsIn(directory: string): Promise<RunEntity[]>;
  allRuns(): Promise<RunEntity[]>;
  /** Runs left open: the app closed on them, or they are walking now. */
  runsStillOpen(): Promise<RunEntity[]>;
  /** Ends a run, or reopens it with `null` when its flow is asked another question. */
  endRun(id: string, endedAt: Date | null): Promise<void>;
  dropRun(id: string): Promise<void>;

  askIn(question: NewQuestion): Promise<RunQuestionEntity>;
  /** Questions of many flows at once, each with its run; batched so a search costs one query per table. */
  askedInRuns(runIds: string[]): Promise<RunQuestionEntity[]>;
  /** Every question of one flow, in the order they were asked. */
  askedIn(runId: string): Promise<RunQuestionEntity[]>;
  dropQuestionsOf(runId: string): Promise<void>;

  attachTo(attachment: NewAttachment): Promise<void>;
  /** The attachments of many questions at once, each with its question. */
  attachedTo(questionIds: string[]): Promise<RunQuestionAttachmentEntity[]>;
  /** Every attachment of one flow's questions. */
  dropAttachedOf(runId: string): Promise<void>;

  stepsOf(runId: string): Promise<RunStepEntity[]>;
  /** The steps with the question each grew from. */
  walkOf(runId: string): Promise<RunStepEntity[]>;
  /** The walks of many flows at once, each step with its run and question. */
  walksOf(runIds: string[]): Promise<RunStepEntity[]>;
  /** One question's steps after a place, however they ended, in the order they ran. */
  stepsOfQuestion(runId: string, questionId: string, afterPlace: number): Promise<RunStepEntity[]>;
  /** One agent's steps of a run after a place, however they ended, in the order they ran; each with who it was. */
  stepsOfAgent(runId: string, agentId: string, afterPlace: number): Promise<RunStepEntity[]>;
  addStep(step: NewStep): Promise<RunStepEntity>;
  dropStepsOf(runId: string): Promise<void>;

  addWho(who: NewWho): Promise<void>;
  whoOf(stepId: string): Promise<RunStepAgentEntity | null>;
  /** The agent of each of many steps, each with its step; batched to avoid a query per row. */
  whoIn(stepIds: string[]): Promise<RunStepAgentEntity[]>;
  addRan(ran: NewRan): Promise<void>;
  ranOf(stepId: string): Promise<RunStepModelEntity | null>;
  addGiven(given: NewGiven): Promise<void>;
  givenOf(stepId: string): Promise<RunStepSettingEntity | null>;
  addCall(call: NewCall): Promise<void>;
  callsOf(stepId: string): Promise<RunCallEntity[]>;
  /** One call by id, with its step; «ПОКАЗАТИ ВИКЛИК» has only the id. */
  callById(id: string): Promise<RunCallEntity | null>;
  /** The calls of many steps at once, each with its step. */
  callsIn(stepIds: string[]): Promise<RunCallEntity[]>;
  addFeed(feed: NewFeed): Promise<void>;
  /** The feeds with the step each came from. */
  feedsOf(stepId: string): Promise<RunStepFeedEntity[]>;
  /** The feeds of many steps at once, each with both ends; «КРОК N» is counted from these. */
  feedsIn(stepIds: string[]): Promise<RunStepFeedEntity[]>;
  addHandoff(handoff: NewHandoff): Promise<void>;
  addMemory(memory: NewMemory): Promise<void>;
  /** Every compression of one run, each with its question and the step that paid for it. */
  memoriesOf(runId: string): Promise<RunMemoryEntity[]>;
  /**
   * The compression that stands for one memory, with its question and step: of an agent's own thread (`questionId`
   * null) or of its shared memory of one question, the one paid in the latest step. Null while none has been written.
   */
  latestMemoryOf(runId: string, agentId: string, questionId: string | null): Promise<RunMemoryEntity | null>;
  handoffsOf(stepId: string): Promise<RunHandoffEntity[]>;

  /** Clears everything written beside one step: its calls, its two edges, the three frozen facts, its compression. */
  dropBesideStep(stepId: string): Promise<void>;
}
