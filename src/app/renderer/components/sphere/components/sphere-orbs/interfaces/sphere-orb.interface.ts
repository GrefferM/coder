import type { ToolSource } from "../../../../../interfaces";

/** One mini-sphere of the arc: one source, or its kind's «+» folding the rest. */
export interface SphereOrb {
  /** The source this mark stands for; null on a «+». */
  group: string | null;
  /**
   * Id of the grant this mark stands for; set on a command, null on a server's mark (its id is in `group`) and on a «+».
   */
  grantId: string | null;
  color: string;
  /** Set only on a «+»; counts the marks of one kind, «+5», «+3». */
  more: string | null;
  /**
   * The source kind, said by shape: a server is a tilted globe, a declared command a rounded square with a prompt, an
   * agent an upright globe with a core. A «+» takes the shape of the kind it folds, dashed and dimmed.
   */
  source: ToolSource;
}
