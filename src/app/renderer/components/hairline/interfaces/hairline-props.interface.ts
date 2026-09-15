export interface HairlineProps {
  /** The rule's own shade unless the block it parts has a colour of its own. */
  color?: string;
  /** The air above and below it, where the rule stands between blocks rather than inside a flow. */
  margin?: string;
  className?: string;
}
