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

/** A run as it is opened: the flow's own facts, before any question or step stands under it. */
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
  /** Whom it is put to, said with the question and not left for the first step to say. */
  askedAgentId: string;
  askedAgentName: string;
  runId: string;
}

/** One finished step of a walk, as the record keeps it; what stands beside it is written separately. */
export interface NewStep {
  place: number;
  walkId: string;
  questionId: string;
  asked: string;
  said: string;
  state: string;
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

/** The model the turn ran on, with its prices and ceilings as they stood then. */
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

/** What the turn was given — its prompt and its own numbers, frozen beside the step. */
export interface NewGiven {
  promptId: string | null;
  prompt: string;
  temperature: number | null;
  maxCalls: number | null;
  stepId: string;
}

/** One call the turn made, with everything it did and how it ended. */
export interface NewCall {
  /** The id the call already has: the record keeps it, it does not hand out a second one. */
  id: string;
  place: number;
  name: string;
  arguments: string;
  pinned: string;
  line: string;
  output: string;
  refusal: string;
  exitCode: number | null;
  /** The server the call went to, and the name it wore then; a command's call has neither. */
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

/** One hand the turn made off, and why it was not taken where it was not. */
export interface NewHandoff {
  place: number;
  toAgentId: string;
  stopReason: string | null;
  stepId: string;
}

/**
 * Every question the record asks of the base, in the record's own words. The services speak this and nothing of
 * TypeORM, so what is kept and how is one file's business (`stores/`), and a test stands over any store that answers.
 */
export interface RunStore {
  /** Opens a run and hands back the row, whose id everything under it points at. */
  openRun(run: NewRun): Promise<RunEntity>;
  runById(id: string): Promise<RunEntity | null>;
  /** Every run of one project, in no particular order; the reader sorts them by the flow's last word. */
  runsIn(directory: string): Promise<RunEntity[]>;
  allRuns(): Promise<RunEntity[]>;
  /** Runs left open — the app was shut on them, or they are walking now. */
  runsStillOpen(): Promise<RunEntity[]>;
  /** Ends a run, or opens it again with `null` when its flow is asked another question. */
  endRun(id: string, endedAt: Date | null): Promise<void>;
  dropRun(id: string): Promise<void>;

  askIn(question: NewQuestion): Promise<RunQuestionEntity>;
  /**
   * The questions of many flows at once, each carrying the run it belongs to. A word looked for over the
   * whole record must not cost a query per run — the search reads each table once and joins in memory.
   */
  askedInRuns(runIds: string[]): Promise<RunQuestionEntity[]>;
  /** Every question of one flow, in the order they were asked. */
  askedIn(runId: string): Promise<RunQuestionEntity[]>;
  dropQuestionsOf(runId: string): Promise<void>;

  stepsOf(runId: string): Promise<RunStepEntity[]>;
  /** The steps with the question each grew from, which a plain read does not carry. */
  walkOf(runId: string): Promise<RunStepEntity[]>;
  /** The walks of many flows at once, each step carrying its run and its question. */
  walksOf(runIds: string[]): Promise<RunStepEntity[]>;
  addStep(step: NewStep): Promise<RunStepEntity>;
  dropStepsOf(runId: string): Promise<void>;

  addWho(who: NewWho): Promise<void>;
  whoOf(stepId: string): Promise<RunStepAgentEntity | null>;
  /**
   * Who every one of many steps was, each carrying its step. A found place wears the name of the agent
   * that said it, and reading that name step by step would cost a query per row.
   */
  whoIn(stepIds: string[]): Promise<RunStepAgentEntity[]>;
  addRan(ran: NewRan): Promise<void>;
  ranOf(stepId: string): Promise<RunStepModelEntity | null>;
  addGiven(given: NewGiven): Promise<void>;
  givenOf(stepId: string): Promise<RunStepSettingEntity | null>;
  addCall(call: NewCall): Promise<void>;
  callsOf(stepId: string): Promise<RunCallEntity[]>;
  /**
   * One call by its own id, with the step it stands in — «ПОКАЗАТИ ВИКЛИК» has an id and nothing else,
   * and everything else about where that call stands hangs off its step.
   */
  callById(id: string): Promise<RunCallEntity | null>;
  /** The calls of many steps at once, each carrying the step it was made in. */
  callsIn(stepIds: string[]): Promise<RunCallEntity[]>;
  addFeed(feed: NewFeed): Promise<void>;
  /** The feeds with the step each came from, which a plain read does not carry. */
  feedsOf(stepId: string): Promise<RunStepFeedEntity[]>;
  /**
   * The feeds of many steps at once, each carrying both ends. «КРОК N» is counted off these, and a search
   * that says the step of every found place needs them for the whole record, not for one run.
   */
  feedsIn(stepIds: string[]): Promise<RunStepFeedEntity[]>;
  addHandoff(handoff: NewHandoff): Promise<void>;
  handoffsOf(stepId: string): Promise<RunHandoffEntity[]>;

  /** Clears everything written beside one step — its calls, its two edges, and the three frozen facts. */
  dropBesideStep(stepId: string): Promise<void>;
}
