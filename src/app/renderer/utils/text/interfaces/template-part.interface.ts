/** One piece of a templated line: its text, and whether it is a brace slot. */
export interface TemplatePart {
  text: string;
  isSlot: boolean;
}
