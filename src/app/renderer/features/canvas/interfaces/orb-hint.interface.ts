/**
 * What a mini-sphere says when the cursor rests on it. The mark itself says nothing — «22 px
 * їх не вмістять» — so the number and the name live here and in the trail's third line, and nowhere else.
 *
 * Three cases and one shape: a server names itself and counts its functions; a command says its own name and no
 * number, because one command is one mark; a порода's «+» says how many of that порода are behind it and names
 * each. A server does not name its functions: «24 імені в підказку не влазять і не для того вона».
 */
export interface OrbHint {
  /** What this is — «MCP-СЕРВЕР», «КОМАНДА ПРОЄКТУ», or «ЩЕ 3 СЕРВЕРИ» on a «+». */
  kind: string;
  /** The server's or the command's own name; nothing on a «+», which names no one thing. */
  name: string;
  /** «2 з 33 функцій» for a server; nothing for a command and nothing on a «+». */
  count: string;
  /** A line per mark folded under a «+»; empty on a mark of its own. */
  lines: string[];
}
