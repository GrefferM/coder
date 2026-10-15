import type { PinnedArgument } from "./pinned-argument.interface";

export interface CommandToolGrant {
  id: string;
  source: "command";
  commandId: string;
  pinned: PinnedArgument[];
}
