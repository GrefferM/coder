/**
 * What is wrong with a server that is not up, where «fell» is only one of the answers. The
 * row says a different sentence for each, and offers the action that would mend that one thing.
 */
export interface ServerTroubleState {
  kind: "tokenMissing" | "valueMissing" | "unreachable" | "fell";
  /** The variable with no value on this machine; nothing for every other trouble. */
  name: string | null;
}

/** Nothing is wrong, or nobody has asked yet. */
export type ServerTrouble = ServerTroubleState | null;
