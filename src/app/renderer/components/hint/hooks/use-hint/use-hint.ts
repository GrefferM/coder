import { useEffect, useRef, useState } from "react";
import { Hint } from "../../hint";
import { HINT_DELAY_MS, HINT_NEIGHBOUR_MS } from "../../constants";
import type { HintStanding } from "./interfaces";
import { createElement } from "react";

/**
 * When the last hint went. Moving from one mark to its neighbour inside 0,3 s shows the next at once: the
 * hand is reading a row, not arriving at it. It is one number for the whole app because that is what it is about
 * — the hand, which is only ever in one place.
 */
let wentAt = 0;

/**
 * The app's one hint. It is built on the interaction the control already has, so a control
 * gets a hint by saying what it says, not by taking another set of handlers that would collide with its own.
 *
 * The waiting: 0,4 s under the cursor, none at all from the keyboard — a hand that came by the
 * keyboard has already asked. The first movement of the canvas puts it away, and it does not come back until the
 * cursor leaves and returns: while dragging, what is under the cursor is the canvas and not the mark.
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

    // The keyboard asks outright; the cursor is given its 0,4 s, unless it came from a neighbour.
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

    // The first movement of the canvas puts it away — a drag, a zoom, a scroll are all that movement.
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

  /**
   * The reading kind stands only where the line really is cut — «влізло цілим, підказки немає, бо
   * дочитувати нічого». What is cut is a fact about the element and nobody else can tell it.
   */
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
