/** Whom a row was last asked, named as they stand today, and whether they are gone. */
export interface AskedStanding {
  name: string;
  /** The agent's current colour; null for an agent the project no longer holds, which is drawn quiet. */
  color: string | null;
  /** The project no longer holds this agent; the name is the record's and dimmer. */
  isGone: boolean;
}
