import { useInteraction } from "../use-interaction";
import { PRESSABLE_KEYS } from "./constants";
import type { KeyboardEvent } from "react";
import type { Pressable } from "./interfaces";

/** A box pressable by key as well as pointer; a key pressed inside a button it holds belongs to that button. */
export function usePressable(onPress: () => void): Pressable {
  const { handlers, ...state } = useInteraction();

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget || !PRESSABLE_KEYS.includes(event.key)) {
      return;
    }

    event.preventDefault();
    onPress();
  }

  return {
    ...state,
    handlers: {
      ...handlers,
      role: "button",
      tabIndex: 0,
      onClick: onPress,
      onKeyDown: handleKeyDown,
    },
  };
}
