/**
 * The variables a local server starts with. The names go into the project file; the values go only to this machine's
 * keychain.
 */
export interface EnvListProps {
  names: string[];
  /** What was typed into each value field this time, by variable name. */
  drafts: Record<string, string>;
  /** A hint per name this machine holds a value for; the values never come back out. */
  held: Record<string, string>;
  onNamesChange: (names: string[]) => void;
  onValueChange: (name: string, value: string) => void;
}
