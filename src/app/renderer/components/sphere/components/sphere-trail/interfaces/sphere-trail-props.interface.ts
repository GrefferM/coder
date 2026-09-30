/** The trail's third line: a prompt, present or not, and a key with one number. */
export interface SphereTrailProps {
  /** The agent stands on a prompt the project still holds; a gone prompt is the trouble mark's to say. */
  hasPrompt: boolean;
  /**
   * Functions granted to the agent across all sources, a command counting as one; broken grants excluded. Zero means no
   * key.
   */
  tools: number;
}
