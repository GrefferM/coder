export interface ChosenLinkState {
  /** The chosen link; the canvas holds it because no panel opens for a link. */
  chosenLinkId: string | null;
  choose: (linkId: string | null) => void;
}
