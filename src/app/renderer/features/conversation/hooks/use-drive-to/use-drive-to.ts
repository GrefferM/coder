import { useEffect } from "react";
import type { StayAtBottom } from "../../../../hooks";

/**
 * Scrolls the stream to the message the search found, centred in the box, after the stream has drawn itself; the stream
 * releases its end-following first.
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
