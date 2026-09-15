/** One turn as the level rule sees it, whether it is a card of the stream or a step of a run read back. */
export interface LevelNode {
  /** The key the level is answered under. */
  id: string;
  /** What whoever it fed names it by — a step's own id, or nothing where the turn has no step yet. */
  at: string | null;
  /** The turns that fed this one, each by its `at`. */
  fedBy: string[];
}
