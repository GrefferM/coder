/** Why a grant cannot be honoured; the cause picks the panel's sentence, and any cause makes the grant broken. */
export type BrokenGrantCause = "command" | "goneFunction" | "goneServer" | "goneAgent";
