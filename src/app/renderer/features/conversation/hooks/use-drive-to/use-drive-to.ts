import { useEffect } from "react";
import type { StayAtBottom } from "../../../../hooks";

/** Scrolls the stream to the found message, centred, once drawn; the stream first stops following its end. */
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
