import type { ToolSource } from "../../../../../../interfaces";

export interface CallPillProps {
  /** A command's own name, or a server's; never a server's function. */
  name: string;
  /** Sets the pill colour, the same as the source's mark on the arc. */
  source: ToolSource;
}
