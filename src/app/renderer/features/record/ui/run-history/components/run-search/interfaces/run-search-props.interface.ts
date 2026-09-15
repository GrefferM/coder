export interface RunSearchProps {
  query: string;
  /** How many runs the record holds at all — the number at rest, and the one said when nothing is found. */
  record: number;
  /** How many places the word stands in — the first number, and what the ceiling is measured on. */
  places: number;
  /** How many runs those places lie in — the second number, and it is not the record's count. */
  runs: number;
  onQuery: (query: string) => void;
}
