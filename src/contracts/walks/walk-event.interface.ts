import type { Agent } from "../project";
import type { PackedAttachment } from "../attachments";
import type { ChatMessage } from "./chat-message.interface";
import type { ChatCost } from "./chat-cost.interface";
import type { IncomingWork } from "./incoming-work.interface";
import type { HandedLine } from "./handed-line.interface";
import type { TurnAnswer } from "./turn-answer.interface";
import type { WalkClosing } from "./walk-closing.interface";
import type { RunUnfinished, WholeStep } from "../runs";

/**
 * Everything that pushes a walk: a fact that has already happened (a question put, an answer back, a wait let go), from
 * which the machine works out what the walk becomes.
 */
export type WalkEvent =
  /** The person put a question to an agent; one walk begins and the question is written when asked. */
  | {
      kind: "put";
      agent: Agent;
      text: string;
      /** Files and folders attached to the question; their packed text goes into the turn's input. */
      attached: PackedAttachment[];
      /** The steps a question resumed from the record grew from; the person's own names none. */
      fedFrom: string[];
      isAgain: boolean;
      /** The question's, walk's and turn's ids and the hour, minted by the adapter, not the machine. */
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
      /** How many suppliers of a converging point passed nothing on. */
      missing: number;
      /** The turn's id and hour, minted by the adapter. */
      turnId: string;
      startedAt: number;
    }
  /** The turn came back — answered, fallen, cut or never begun. */
  | {
      kind: "answered";
      agent: Agent;
      turnId: string;
      runKey: string;
      /** What this turn was given, so the card names the steps that fed it and the record writes them. */
      incoming: IncomingWork[];
      startAgentId: string;
      /** The words the turn was put with, as the card and record take them. */
      asked: string;
      /** Characters of memory the turn carried ahead of them. */
      memoryLength: number;
      answer: TurnAnswer;
      /** The card's id, minted by the adapter. */
      saidId: string;
      startedAt: number;
      endedAt: number;
    }
  /** The answer took its lines out; a link not taken is included with its reason. */
  | {
      kind: "handedOn";
      from: Agent;
      cost: ChatCost | null;
      seconds: number;
      startAgentId: string;
      runKey: string;
      out: HandedLine[];
    }
  /** One supplier of a converging point settled, with work or with nothing. */
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
  /** A point stopped waiting, so the waits behind it are let go too. */
  | { kind: "released"; fromId: string; startAgentId: string; runKey: string }
  /**
   * A walk broke or was stopped by hand; no turn of it begins after. A null `runKey` is the person's «ЗУПИНИТИ»: every
   * walk of this stream except one already put away.
   */
  | { kind: "stopped"; runKey: string | null }
  /** The row this walk's question opened; all the walk's words are written into it. */
  | { kind: "rowOpened"; runKey: string; runId: string }
  /** The walk's question is in the record; its first turn may go. */
  | { kind: "questionWritten"; runKey: string }
  /** The record refused the walk's question; nothing of the walk went. */
  | { kind: "questionUnsaved"; runKey: string; failure: string }
  /** A turn's step is in the record; its lines may go out. */
  | { kind: "stepWritten"; runKey: string; saidId: string }
  /** The record refused a turn's step; the walk stops there. */
  | { kind: "stepUnsaved"; runKey: string; saidId: string; failure: string }
  /** The record refused to stamp the walk's end. */
  | { kind: "closeUnsaved"; runKey: string; closing: WalkClosing; failure: string }
  /** The walk's end is stamped after all. */
  | { kind: "walkClosed"; runKey: string }
  /** The record could not be read for a repeat pressed under this card. */
  | { kind: "recordUnread"; saidId: string; failure: string }
  /** The stream was emptied; its walks run on into the record and draw nothing. */
  | { kind: "putAway"; stream: string }
  /** «СПИТАТИ ЩЕ РАЗ» was pressed under one turn; the record is read to find what to resume. */
  | { kind: "sayAgain"; said: ChatMessage }
  /**
   * One question's walk resumed where it broke, as read back from the record: turns to rerun verbatim, and arrived work
   * never taken up.
   */
  | {
      kind: "repeated";
      left: RunUnfinished;
      walk: WholeStep[];
      startAgentId: string;
      runKey: string;
      /** The row and question this repeat writes on into; it opens neither. */
      runId: string;
      questionId: string;
      /** The repeat is not a question of the person's, so it stands in the block of the one it resumes. */
      askedAt: number;
      /** The agent a never-sent question was aimed at; the record holds no step for it. */
      notSentTo: string | null;
      /** That question's words, for the one case where the record has no step to rerun. */
      asked: string;
      /** The files and folders sent with it, from the record. */
      attached: PackedAttachment[];
    };
