/**
 * One line of what a mark says under the pointer: the name of a mark of its own, or one of the marks folded under a
 * «+». Carries the id of what it stands for.
 */
export interface ArmedMarkRow {
  /** The source this line stands for: the commands' key for a command, `server:<id>` for a server. */
  group: string;
  /** A command names its own grant; a server names none (its id is in `group`). */
  grantId: string | null;
  /** The command's or server's own name; no «N з M» count, which lives in the hint and the panel row. */
  name: string;
  color: string;
  /** All of this source's grants point at nothing; the line goes first in the trouble tone. */
  isBroken: boolean;
}
