/** What is wrong with a server that is not up; each kind gets its own sentence and the action that mends it. */
export interface ServerTroubleState {
  kind: "tokenMissing" | "valueMissing" | "unreachable" | "fell";
  /** The variable with no value on this machine; null for every other trouble. */
  name: string | null;
}

/** Nothing is wrong, or nobody has asked yet. */
export type ServerTrouble = ServerTroubleState | null;
