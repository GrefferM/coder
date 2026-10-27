import type { Agent } from "../project";
import type { ChatStopReason } from "../runs";
import type { PackedAttachment } from "../attachments";
import type { AnsweredTurn } from "./answered-turn.interface";
import type { IncomingWork } from "./incoming-work.interface";
import type { WalkClosing } from "./walk-closing.interface";
import type { WrittenTurn } from "./written-turn.interface";

/**
 * What a walk asks the world to do; the machine names them, the adapter carries them out and reports back as an event.
 */
export type WalkEffect =
  /** Put this turn to the provider. */
  | {
      kind: "askMachine";
      agent: Agent;
      turnId: string;
      questionId: string;
      incoming: IncomingWork[];
      startAgentId: string;
      viaLinkIds: string[];
      runKey: string;
      isAgain: boolean;
      startedAt: number;
      asked: string;
    }
  /** Stop the turn that is out. */
  | { kind: "stopMachine"; turnId: string }
  /** Puts work to an agent: what came down a line, or what a converging point gathered; the adapter mints the turn. */
  | {
      kind: "askAgent";
      agent: Agent;
      incoming: IncomingWork[];
      startAgentId: string;
      viaLinkIds: string[];
      runKey: string;
      /** A walk resumed from the record, whose words already stand in the stream. */
      isAgain: boolean;
      /** How many suppliers of a converging point passed nothing on; the turn is told. */
      missing: number;
    }
  /** This point has nothing to give, so whoever waits behind it is let down. */
  | { kind: "letDown"; fromId: string; startAgentId: string; runKey: string }
  /** The words a turn was given: the person's own, or what arrived down each line. */
  | {
      kind: "sayAsked";
      runKey: string;
      agentId: string;
      incoming: IncomingWork[];
      questionId: string;
      askedAt: number;
      isAgain: boolean;
    }
  /** The row about one link: where the work went and where it could not. */
  | {
      kind: "sayHandoff";
      runKey: string;
      fromAgentId: string | null;
      toAgentId: string;
      stopReason: ChatStopReason | null;
      questionId: string;
      askedAt: number;
    }
  /**
   * A walk begins: the writer takes it and its question opens the conversation's row or goes on in the standing one.
   */
  | {
      kind: "openWalk";
      runKey: string;
      questionId: string;
      askedAt: number;
      runId: string | null;
      agent: Agent;
      asked: string;
      /** The files and folders sent with the question; the record keeps them beside it. */
      attached: PackedAttachment[];
    }
  /** The card one turn became, put in the stream of its walk. */
  | { kind: "sayAnswer"; runKey: string; turn: AnsweredTurn }
  /** Writes one step of the walk; its card then takes the step's id. */
  | { kind: "writeTurn"; runKey: string; saidId: string; turn: WrittenTurn }
  /** One turn of the walk is back; the walk is over when it was the last one out. */
  | { kind: "turnBack"; runKey: string }
  /**
   * Reads the run back and resumes the broken walk; the question it stands under is found only after that walk's writes
   * have settled.
   */
  | {
      kind: "askAgain";
      runId: string;
      /** The question the turn stood under — the card knows it by id. */
      questionId: string;
      walkId: string | null;
      /** The agent a never-sent question was aimed at; the record holds no step for it. */
      notSentTo: string | null;
      /** The card the repeat was pressed under; an unread record is said there. */
      saidId: string;
    }
  /** A walk resumed from the record: the writer takes it and it writes on into its existing row. */
  | { kind: "takeWalk"; runKey: string; askedAt: number; runId: string; questionId: string }
  /** The writer lets the walk go without closing its row: the record refused part of it. */
  | { kind: "dropWalk"; runKey: string }
  /** Stamps the walk's end again, after the record refused it. */
  | { kind: "closeAgain"; runKey: string; closing: WalkClosing };
