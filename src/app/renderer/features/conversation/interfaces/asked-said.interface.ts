import type { IncomingWork } from "./incoming-work.interface";

/** The words one turn was given, as the walk says them. */
export interface AskedSaid {
  /** One id per word said, minted where they are said. */
  ids: string[];
  runKey: string;
  agentId: string;
  incoming: IncomingWork[];
  questionId: string;
  askedAt: number;
  at: number;
  /** A repeat says nothing again — the words it picks up already stand in the stream. */
  isAgain: boolean;
}
