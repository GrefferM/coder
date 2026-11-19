import { useEffect, useRef } from "react";
import type { EndReadingHands, WidgetStep } from "../../interfaces";

/**
 * Reads each end of a walk aloud as it arrives, one after another in the order they ended (52h). Only an end that came
 * while its sphere stood chosen is read: what ended before the widget opened, or before the sphere was chosen, is
 * history, however late its walks reach the widget, and so is an end read back from the record, as a run opened from the
 * history shows its answers. While the speaker is crossed, an end that comes is let pass unread, and none is waiting.
 */
export function useEndReading({ exchanges, aloud, sphereId, isSilent }: EndReadingHands): void {
  /** Every end already read or waiting, by the answer's id. */
  const queued = useRef(new Set<string>());
  /** Ends waiting for the voice, oldest first. */
  const waiting = useRef<WidgetStep[]>([]);
  /** Since when the chosen sphere has stood chosen; an end before it is history. */
  const since = useRef({
    sphereId,
    at: Date.now(),
  });

  if (since.current.sphereId !== sphereId) {
    since.current = {
      sphereId,
      at: Date.now(),
    };
    waiting.current = [];
  }

  if (isSilent) {
    waiting.current = [];
  }

  exchanges
    .flatMap((exchange) => exchange.steps)
    .filter((step) => step.isEnd && step.isLive && !step.isFailure && !queued.current.has(step.id))
    .filter((step) => new Date(step.endedAt).getTime() >= since.current.at)
    .forEach((step) => {
      queued.current.add(step.id);

      if (!isSilent) {
        waiting.current.push(step);
      }
    });

  useEffect(() => {
    if (aloud.readingId !== null) {
      return;
    }

    const next = waiting.current.shift();

    if (next !== undefined) {
      aloud.read(next.id, next.text);
    }
  });
}
