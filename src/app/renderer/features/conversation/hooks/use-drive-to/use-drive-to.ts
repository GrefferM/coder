import { useEffect } from "react";
import type { StayAtBottom } from "../../../../hooks";

/**
 * The stream rides to the message the search found, and not to the start of the run: the snippet promised that
 * message. It rides after the stream has drawn itself — a message not yet on screen has nowhere to ride to — and
 * lands in the middle of the box, so what stands around the match is read with it.
 *
 * It lets the end go first: a stream keeps itself at its end while the person stands there, and that would pull
 * the ride back the moment the next word arrived. Standing anywhere but the end is not following it.
 */
export function useDriveTo(stream: StayAtBottom<HTMLElement>, foundId: string | null): void {
  const { box, stopFollowing } = stream;

  useEffect(() => {
    const node = box.current;

    if (node === null || foundId === null) {
      return;
    }

    stopFollowing();

    const ride = requestAnimationFrame(() => {
      node.querySelector(`[data-said="${CSS.escape(foundId)}"]`)?.scrollIntoView({
        block: "center",
      });
    });

    return () => cancelAnimationFrame(ride);
  }, [box, stopFollowing, foundId]);
}
