import { useEffect, useRef, useState } from "react";
import { Hint } from "../../hint";
import { HINT_DELAY_MS, HINT_NEIGHBOUR_MS } from "../../constants";
import type { HintStanding } from "./interfaces";
import { createElement } from "react";

/** When the last hint went; app-wide, since the hand is in one place. */
let wentAt = 0;

/**
 * The app's one hint, built on the control's interaction. Waits 0,4 s under the cursor, not at all from the keyboard;
 * the canvas's first movement puts it away until the cursor leaves and returns.
 */
export function useHint<Held extends HTMLElement>(
  text: string,
  isLit: boolean,
  isFocused = false,
  isReading = false,
): HintStanding<Held> {
  const ref = useRef<Held | null>(null);
  const [isShown, setIsShown] = useState(false);
  const [wasPutAway, setWasPutAway] = useState(false);

  useEffect(() => {
    if (!isLit || wasPutAway || text === "") {
      setIsShown(false);

      return;
    }

    // Keyboard focus, or arrival from a neighbour, shows it at once; otherwise the cursor waits its delay.
    if (isFocused || Date.now() - wentAt < HINT_NEIGHBOUR_MS) {
      setIsShown(true);

      return;
    }

    const waiting = window.setTimeout(() => setIsShown(true), HINT_DELAY_MS);

    return () => window.clearTimeout(waiting);
  }, [isLit, isFocused, wasPutAway, text]);

  useEffect(() => {
    if (!isLit) {
      setWasPutAway(false);
    }
  }, [isLit]);

  useEffect(() => {
    if (!isShown) {
      return;
    }

    wentAt = Date.now();

    // Any canvas movement (drag, zoom, scroll) puts it away.
    const putAway = () => setWasPutAway(true);

    window.addEventListener("pointerdown", putAway);
    window.addEventListener("wheel", putAway);
    window.addEventListener("scroll", putAway, true);

    return () => {
      wentAt = Date.now();
      window.removeEventListener("pointerdown", putAway);
      window.removeEventListener("wheel", putAway);
      window.removeEventListener("scroll", putAway, true);
    };
  }, [isShown]);

  /** The reading kind shows only where the line is actually cut. */
  const isWorthIt = !isReading || (ref.current !== null && ref.current.scrollWidth > ref.current.clientWidth);
  const box = isShown && isWorthIt ? (ref.current?.getBoundingClientRect() ?? null) : null;

  return {
    ref,
    hint:
      box === null
        ? null
        : createElement(Hint, {
            text,
            isReading,
            at: {
              left: box.left,
              top: box.top,
              bottom: box.bottom,
            },
          }),
  };
}
