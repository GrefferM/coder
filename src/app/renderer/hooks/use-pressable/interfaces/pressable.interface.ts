import type { InteractionState } from "../../use-interaction/interfaces";
import type { KeyboardEvent } from "react";

/** A box that is pressed like a button while holding buttons of its own. */
export interface Pressable extends Omit<InteractionState, "handlers"> {
  handlers: InteractionState["handlers"] & {
    role: "button";
    tabIndex: 0;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
  };
}
