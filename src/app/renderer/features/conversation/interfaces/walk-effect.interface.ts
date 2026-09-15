import type { Agent, ChatStopReason } from "../../../interfaces";
import type { AnsweredTurn } from "./answered-turn.interface";
import type { IncomingWork } from "./incoming-work.interface";
import type { WrittenTurn } from "./written-turn.interface";

/**
 * What a walk asks the world to do. The machine only names them; the adapter carries them out and brings
 * back what happened as an event.
 */
export type WalkEffect =
  /** Put this turn to the provider. */
  | {
      kind: "askMachine";
      agent: Agent;
      turnId: string;
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
  /** Put the work a converging point has gathered to the agent standing there. */
  | {
      kind: "askAgent";
      agent: Agent;
      incoming: IncomingWork[];
      startAgentId: string;
      viaLinkIds: string[];
      runKey: string;
      /** A walk picked up out of the record, whose words already stand in the stream above it. */
      isAgain: boolean;
    }
  /** This point has nothing to give, so let down whoever waits behind it. */
  | { kind: "letDown"; fromId: string; startAgentId: string; runKey: string }
  /** The words a turn was given — the person's own, or what arrived down each line. */
  | {
      kind: "sayAsked";
      runKey: string;
      agentId: string;
      incoming: IncomingWork[];
      questionId: string;
      askedAt: number;
      isAgain: boolean;
    }
  /** The row about one link — where the work went, and where it could not. */
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
   * A walk begins — the writer takes it, and its question opens the row this conversation writes into or
   * goes on in the one already standing.
   */
  | {
      kind: "openWalk";
      runKey: string;
      questionId: string;
      askedAt: number;
      runId: string | null;
      agent: Agent;
      asked: string;
    }
  /** The card one turn became, put in the stream of the walk it ran in. */
  | { kind: "sayAnswer"; runKey: string; turn: AnsweredTurn }
  /** Write one step of the walk; the card it was said as then takes the step's id. */
  | { kind: "writeTurn"; runKey: string; saidId: string; turn: WrittenTurn }
  /** One turn of the walk is back — the walk is over when it was the last one out. */
  | { kind: "turnBack"; runKey: string }
  /**
   * Read the run back and pick the broken walk up where it stopped. The walk is named here; which question
   * it stands under is found once the writes of that walk have settled, and only then.
   */
  | {
      kind: "askAgain";
      runId: string;
      /** The question the turn stood under — the card knows it by id. */
      questionId: string;
      walkId: string | null;
      /** The agent a question that never went was aimed at, since the record holds no step for it. */
      notSentTo: string | null;
    }
  /** A walk picked up out of the record — the writer takes it, and it writes on into the row it has. */
  | { kind: "takeWalk"; runKey: string; askedAt: number; runId: string; questionId: string };
