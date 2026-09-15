/**
 * The variables a local server is started with. The **names** are the form's own values and go into
 * the project file; the values are typed here and go nowhere but this machine's keychain.
 */
export interface EnvListProps {
  names: string[];
  /** What was typed into each value field this time, by the variable's name. */
  drafts: Record<string, string>;
  /** A hint per name this machine already holds a value for; the values themselves never come back out of it. */
  held: Record<string, string>;
  onNamesChange: (names: string[]) => void;
  onValueChange: (name: string, value: string) => void;
}
