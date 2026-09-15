/**
 * How the dot in a row's head is drawn for one state. The word of state is quiet in all five and takes no
 * pill — the one coloured word in the head is the name — so the colour of the state lives in the dot alone.
 */
export interface RunStateDot {
  color: string;
  /** «НЕ ПІШОВ» has no colour to give: nothing was sent, so the dot is an outline around an empty place. */
  border: string | undefined;
}
