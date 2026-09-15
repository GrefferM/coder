/** Whom a row was asked last, named as they stand today — and whether they are gone. */
export interface AskedStanding {
  name: string;
  /**
   * The colour that agent goes by today, so the name is read at a glance and not hunted for. Null for an agent the
   * project no longer holds: the record kept no colour of theirs, and a gone name is drawn quiet on purpose.
   */
  color: string | null;
  /** The project no longer holds this agent, so the name is the record's and reads dimmer. */
  isGone: boolean;
}
