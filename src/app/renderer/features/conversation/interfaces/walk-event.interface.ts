import type { Agent } from "../../../interfaces";
import type { ChatMessage } from "./chat-message.interface";
import type { ChatCost } from "./chat-cost.interface";
import type { IncomingWork } from "./incoming-work.interface";
import type { LinkOut } from "./link-out.interface";
import type { TurnAnswer } from "./turn-answer.interface";
import type { RunUnfinished, WholeStep } from "../../record";

/**
 * Everything that pushes a walk. Each is a fact that has already happened — a question put, an answer back,
 * a wait let go — and the machine says what the walk becomes because of it.
 */
export type WalkEvent =
  /**
   * The person put a question to an agent. One walk begins on it, and the question is written
   * down the moment it is asked.
   */
  | {
      kind: "put";
      agent: Agent;
      text: string;
      /** The steps a question picked up out of the record grew from; the person's own names none. */
      fedFrom: string[];
      isAgain: boolean;
      /** The question's, the walk's and the turn's own names and the hour, minted by the adapter: the machine invents none. */
      questionId: string;
      runKey: string;
      askedAt: number;
      turnId: string;
    }
  /** Work was put to an agent, by a person or down a line. */
  | {
      kind: "asked";
      agent: Agent;
      incoming: IncomingWork[];
      startAgentId: string;
      viaLinkIds: string[];
      runKey: string;
      isAgain: boolean;
      /** The turn's own name and hour, minted by the adapter: the machine invents neither. */
      turnId: string;
      startedAt: number;
    }
  /** The turn came back — answered, fallen, cut or never begun. */
  | {
      kind: "answered";
      agent: Agent;
      turnId: string;
      runKey: string;
      /** What this turn was given, so the card names the steps that fed it and the record writes them down. */
      incoming: IncomingWork[];
      startAgentId: string;
      /** The words the turn was put with, as the card and the record take them. */
      asked: string;
      answer: TurnAnswer;
      /** The card's own name, minted by the adapter: the machine invents none. */
      saidId: string;
      startedAt: number;
      endedAt: number;
    }
  /** The answer took its lines out; a link not taken is here too, with its word for why. */
  | {
      kind: "handedOn";
      from: Agent;
      text: string;
      cost: ChatCost | null;
      seconds: number;
      startAgentId: string;
      runKey: string;
      out: LinkOut[];
    }
  /** One supplier of a converging point settled — with work, or with nothing to give. */
  | {
      kind: "settled";
      to: Agent;
      awaited: string[];
      fromId: string;
      work: IncomingWork | null;
      startAgentId: string;
      via: string | null;
      runKey: string;
    }
  /** A point stopped waiting, so the waits standing behind it are let go too. */
  | { kind: "released"; fromId: string; startAgentId: string; runKey: string }
  /**
   * A walk broke or was stopped by hand; no turn of it begins after this. Nothing at all for the runKey is
   * the person's own «ЗУПИНИТИ»: every walk of this stream, except one already put away — it was let go, not stopped.
   */
  | { kind: "stopped"; runKey: string | null }
  /** The row this walk's question opened; every word of the walk is written into it. */
  | { kind: "rowOpened"; runKey: string; runId: string }
  /** The stream was emptied — its walks run on into the record and draw nothing. */
  | { kind: "putAway"; stream: string }
  /** «СПИТАТИ ЩЕ РАЗ» was pressed under one turn — the record is read to find what to pick up. */
  | { kind: "sayAgain"; said: ChatMessage }
  /**
   * One question's walk is picked up where it broke, as the record read it back: the turns to run again
   * word for word, and the work that arrived and was never taken up.
   */
  | {
      kind: "repeated";
      left: RunUnfinished;
      walk: WholeStep[];
      startAgentId: string;
      runKey: string;
      /** The row and the question this repeat writes on into; the repeat opens neither. */
      runId: string;
      questionId: string;
      /** The repeat is no question of the person's, so it stands in the block of the one it picks up. */
      askedAt: number;
      /** The agent a question that never went was aimed at, since the record holds no step for it. */
      notSentTo: string | null;
      /** That question's own words, for the one case the record has no step to run again. */
      asked: string;
    };
