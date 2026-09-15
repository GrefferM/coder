import { useCallback, useEffect, useRef, useState } from "react";
import { STAY_AT_BOTTOM_REACH_PX } from "./constants";
import type { StayAtBottom } from "./interfaces";

/**
 * Keeps a scrolling box at its end; scrolling up holds until the person returns; a new `stream` starts at its end.
 *
 * It also says whether the end is in view, because the one thing that decides whether the button down is
 * there is exactly the number this already measures — a second watcher on the same box would count it twice.
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
      // React drops a set of the value already held, so this is quiet on every scroll that changes nothing.
      setIsAtEnd(isThere);
    };

    const follow = () => {
      if (stays.current) {
        node.scrollTop = node.scrollHeight;
      }

      // What grows can also shrink, and a stream that no longer fills the box has its end in view again.
      watch();
    };

    // A stream of one's own: the end of it, whatever the last one was showing.
    stays.current = true;
    setIsAtEnd(true);
    follow();

    // The answer is written a word at a time, and a card can appear under it; both are the box growing.
    const growing = new MutationObserver(follow);
    /**
     * The box itself can shrink while nothing in it changes — the field under the stream is pulled taller, the
     * window is made shorter — and then the end of the stream slides under the fold with nothing to notice it.
     * Whoever stood at the end stays at the end: the stream rises with the field instead of being covered by it.
     */
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
   * The search rides to a place of its own, and the box must stop following its end or it would
   * pull the ride back the moment anything grew. Standing anywhere but the end is the person's own act, and this
   * says so on their behalf.
   *
   * It is held still between renders on purpose: a ride is one act, and a fresh function each time would make the
   * effect that rides run again on every render — the stream would be pinned to the match and the person could not
   * scroll away from it at all.
   */
  const stopFollowing = useCallback(() => {
    stays.current = false;
    setIsAtEnd(false);
  }, []);

  /** The one act of the button down — the end of the stream, and the person is standing there again. */
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
