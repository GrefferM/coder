/** One piece of a line with substitutions: the text itself, and whether it is a slot in braces. */
export interface TemplatePart {
  text: string;
  isSlot: boolean;
}
