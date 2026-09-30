/**
 * Why a grant cannot be honoured. The reason decides the sentence the panel says and
 * nothing else — for the wall and for the sphere's mark, a grant that has any reason at all is broken.
 */
export type BrokenGrantCause = "command" | "goneFunction" | "goneServer" | "goneAgent";
