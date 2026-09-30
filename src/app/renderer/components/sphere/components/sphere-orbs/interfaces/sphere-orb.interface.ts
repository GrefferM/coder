import type { ToolSource } from "../../../../../interfaces";

/** One mini-sphere of the arc — one source, or its порода's «+» that folds the rest. */
export interface SphereOrb {
  /** The source this mark stands for; nothing on a «+», which stands for no one source. */
  group: string | null;
  /**
   * The grant this mark stands for, by its own id. A command wears a mark of its own, so it names the one grant
   * behind it and a press has a page to open; a server's mark stands for the whole server and names no single
   * grant — the server's own id is in the group — and a «+» stands for no one thing at all.
   */
  grantId: string | null;
  color: string;
  /** Set only on a «+», and it counts marks of one порода — «+5», «+3». */
  more: string | null;
  /**
   * What kind of source this is, said by the shape and not by a word. A server is a tilted globe, because that
   * is what a sphere is here; a declared command is a rounded square with a prompt in it, because a command is a
   * line somebody runs; an agent is an upright globe with a core, a small sphere of its own. A «+» wears the shape
   * of the порода it folds, dashed and dimmed.
   */
  source: ToolSource;
}
