import type { PinnedArgument } from "./pinned-argument.interface";

/** One declared command granted to an agent. */
export interface CommandToolGrant {
  id: string;
  source: "command";
  commandId: string;
  pinned: PinnedArgument[];
}
