import { useCallback, useEffect, useRef, useState } from "react";
import { STAY_AT_BOTTOM_REACH_PX } from "./constants";
import type { StayAtBottom } from "./interfaces";

/**
 * Keeps a scrolling box at its end; scrolling up holds until the person returns; a new `stream` starts at its end.
 *
 * Also reports whether the end is in view, from the same measurement.
 */
export function useStayAtBottom<T extends HTMLElement>(stream: string | null): StayAtBottom<T> {
  const box = useRef<T>(null);
  const stays = useRef(true);
  const [isAtEnd, setIsAtEnd] = useState(true);

  useEffect(() => {
    const node = box.current;

    if (node === null) {
      return;
    }

    const watch = () => {
      const seen = node.scrollHeight - node.scrollTop - node.clientHeight;
      const isThere = seen <= STAY_AT_BOTTOM_REACH_PX;

      stays.current = isThere;
      // React drops a set of the value already held, so unchanged scrolls are quiet.
      setIsAtEnd(isThere);
    };

    const follow = () => {
      if (stays.current) {
        node.scrollTop = node.scrollHeight;
      }

      // A stream that no longer fills the box has its end in view again.
      watch();
    };

    // A new stream starts at its end.
    stays.current = true;
    setIsAtEnd(true);
    follow();

    // Text or cards added to the stream grow the box.
    const growing = new MutationObserver(follow);
    /** The box can shrink with nothing in it changing; whoever stood at the end stays at the end. */
    const shrinking = new ResizeObserver(follow);

    growing.observe(node, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    shrinking.observe(node);
    node.addEventListener("scroll", watch);

    return () => {
      growing.disconnect();
      shrinking.disconnect();
      node.removeEventListener("scroll", watch);
    };
  }, [stream]);

  /**
   * Stops following the end, so a search ride to a higher place is not pulled back. Stable across renders, or the riding
   * effect would rerun every render.
   */
  const stopFollowing = useCallback(() => {
    stays.current = false;
    setIsAtEnd(false);
  }, []);

  /** The button down: scrolls to the end and resumes following. */
  const goToEnd = useCallback(() => {
    const node = box.current;

    if (node !== null) {
      node.scrollTop = node.scrollHeight;
    }
  }, []);

  return {
    box,
    isAtEnd,
    stopFollowing,
    goToEnd,
  };
}
