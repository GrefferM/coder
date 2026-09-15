import type { MouseEvent } from "react";

/** Interaction state and its handlers; `isLit` covers pointer-over and keyboard focus, `isFocused` keyboard only. */
export interface InteractionState {
  isPointedAt: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isLit: boolean;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseDown: (event: MouseEvent) => void;
    onMouseUp: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}
