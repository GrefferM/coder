export interface ChosenLinkState {
  /** The link standing chosen; no panel opens for a link, so the canvas holds it. */
  chosenLinkId: string | null;
  choose: (linkId: string | null) => void;
}
