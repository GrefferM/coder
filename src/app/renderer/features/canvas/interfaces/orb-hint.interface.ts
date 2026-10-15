/**
 * What a mini-sphere says under the cursor. A server names itself and counts its functions; a command or an agent
 * gives its own name and no number; a «+» gives how many are behind it and names each.
 */
export interface OrbHint {
  /** What this is: «MCP-СЕРВЕР», «КОМАНДА ПРОЄКТУ», or «ЩЕ 3 СЕРВЕРИ» on a «+». */
  kind: string;
  /** The server's, command's or agent's own name; empty on a «+». */
  name: string;
  /** «2 з 33 функцій» for a server; empty for a command, an agent and a «+». */
  count: string;
  /** A line per mark folded under a «+»; empty on a mark of its own. */
  lines: string[];
}
