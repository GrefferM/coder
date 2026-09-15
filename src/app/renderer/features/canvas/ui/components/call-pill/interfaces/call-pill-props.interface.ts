export interface CallPillProps {
  /** A command's own name, or a server's — never a server's function. */
  name: string;
  /** The pill wears its source's colour, the same one that source's mark wears on the arc. */
  isCommand: boolean;
}
