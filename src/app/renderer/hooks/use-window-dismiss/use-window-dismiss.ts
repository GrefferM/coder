import { useEffect, useRef } from "react";
import type { WindowDismissTrigger } from "./interfaces";

/** Count of things open over the app (list, menu, switcher) that take the next click for themselves; not a note. */
let standing = 0;

/** Whether anything is open at this instant; read inside an event, not rendered. */
export function isSomethingOpen(): boolean {
  return standing > 0;
}

/** Dismisses on the next window click, or for `press` on capture-phase mousedown; subscribes one task late. */
export function useWindowDismiss(
  isOpen: boolean,
  onDismiss: (event: MouseEvent) => void,
  trigger: WindowDismissTrigger = "click",
  isStanding = true,
): void {
  const dismiss = useRef(onDismiss);

  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isStanding) {
      standing += 1;
    }

    function handleDismiss(event: MouseEvent) {
      dismiss.current(event);
    }

    const isPress = trigger === "press";
    const heard = isPress ? "mousedown" : "click";
    const subscription = window.setTimeout(() => window.addEventListener(heard, handleDismiss, isPress));

    return () => {
      if (isStanding) {
        standing -= 1;
      }

      window.clearTimeout(subscription);
      window.removeEventListener(heard, handleDismiss, isPress);
    };
  }, [isOpen, trigger, isStanding]);
}
