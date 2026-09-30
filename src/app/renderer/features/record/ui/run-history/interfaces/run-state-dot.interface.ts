/** How the dot in a row's head is drawn for one state; the state's colour lives in the dot alone. */
export interface RunStateDot {
  color: string;
  /** «НЕ ПІШОВ» has no colour: nothing was sent, so the dot is an empty outline. */
  border: string | undefined;
}
