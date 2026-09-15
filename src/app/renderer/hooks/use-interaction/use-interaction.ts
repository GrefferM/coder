import { useState } from "react";
import { useKeyboardMode } from "../use-keyboard-mode";
import type { MouseEvent } from "react";
import type { InteractionState } from "./interfaces";

/** Interaction state of a pressable control; mouse leave clears the press. */
export function useInteraction(): InteractionState {
  const [isPointedAt, setIsPointedAt] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const isKeyboard = useKeyboardMode();
  const isFocused = hasFocus && isKeyboard;

  return {
    isPointedAt,
    isPressed,
    isFocused,
    isLit: isPointedAt || isFocused,
    handlers: {
      onMouseEnter: () => setIsPointedAt(true),
      onMouseLeave: () => {
        setIsPointedAt(false);
        setIsPressed(false);
      },
      onMouseDown: (event: MouseEvent) => {
        if (event.button === 0) {
          setIsPressed(true);
        }
      },
      onMouseUp: () => setIsPressed(false),
      onFocus: () => setHasFocus(true),
      onBlur: () => setHasFocus(false),
    },
  };
}
