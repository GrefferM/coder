/**
 * The trail's third line — what an agent **is**, said as quietly as the canvas can say it.
 * The prompt is there or it is not; the key carries one number and no second one.
 */
export interface SphereTrailProps {
  /** This agent stands on a prompt the project still holds — a prompt that is gone is the trouble mark's to say. */
  hasPrompt: boolean;
  /**
   * How many functions are granted to this agent, every source together, a command counting as one.
   * Broken grants are not in it — «числа скрізь рахують те, що можна покликати». Zero means no key at all.
   */
  tools: number;
}
