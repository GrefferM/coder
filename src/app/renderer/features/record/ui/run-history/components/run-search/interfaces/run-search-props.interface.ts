export interface RunSearchProps {
  query: string;
  /** How many runs the record holds: the count at rest and when nothing is found. */
  record: number;
  /** How many places the word stands in: the first number, which the limit applies to. */
  places: number;
  /** How many runs those places lie in: the second number, not the record's count. */
  runs: number;
  onQuery: (query: string) => void;
}
