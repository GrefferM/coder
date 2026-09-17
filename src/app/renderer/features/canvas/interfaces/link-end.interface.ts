/**
 * One end of a line as the pill names it: what it is called, in what colour, and where it stands. An agent
 * gives all three; an end that names nobody gives its id and the quiet tone, so a dead line can still be read
 * and taken away.
 */
export interface LinkEnd {
  name: string;
  color: string;
  x: number;
  y: number;
}
