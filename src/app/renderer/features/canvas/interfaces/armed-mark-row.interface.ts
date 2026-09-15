/**
 * One line of what a mark says under the pointer — the one name of a mark of its own, or a line per
 * mark folded under a «+». It carries the id of what it stands for, so choosing it opens that page without
 * anything being looked up by name.
 */
export interface ArmedMarkRow {
  /** The source this line stands for: the commands' key for a command, `server:<id>` for a server. */
  group: string;
  /** A command names its own grant, so a press has one page to open; a server names none — its id is in the group. */
  grantId: string | null;
  /**
   * The command's or the server's own name, and the whole of what the line says. No «N з M» beside it: a name
   * cut short for a number to fit is a worse line than one without the number, and «1 з 0» on a server that is
   * down reads as a mistake in counting rather than as a server saying nothing. The number
   * lives in the hint and on the row in the panel, where there is room for it.
   */
  name: string;
  color: string;
  /** This source's grants all point at nothing — the line stands first and wears the trouble tone. */
  isBroken: boolean;
}
