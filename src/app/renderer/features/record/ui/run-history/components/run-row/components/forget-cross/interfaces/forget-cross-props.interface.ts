import type { InteractionState } from "../../../../../../../../../hooks";

export interface ForgetCrossProps {
  /** The cross's own pointer and focus, held by the row — one word covers the row and the cross alike. */
  press: InteractionState;
  isRaised: boolean;
  onForget: () => void;
}
