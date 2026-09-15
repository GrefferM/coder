export interface HeldServerProps {
  name: string;
  /** «5 з 24»: connecting took the whole server, and the screen behind this row can let single functions out. */
  held: number;
  functions: number;
  onOpen: () => void;
}
