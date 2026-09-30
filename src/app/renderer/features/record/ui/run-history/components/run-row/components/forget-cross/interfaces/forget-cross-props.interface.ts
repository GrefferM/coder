import type { InteractionState } from "../../../../../../../../../hooks";

export interface ForgetCrossProps {
  /** The cross's own pointer and focus, held by the row. */
  press: InteractionState;
  isRaised: boolean;
  onForget: () => void;
}
