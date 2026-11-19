import { useEffect, useRef } from "react";
import type { ReadAloud } from "../../../speech";
import type { WidgetExchange, WidgetStep } from "../../interfaces";

/**
 * Reads each end of a walk aloud as it arrives, one after another in the order they ended (52h). Only an end that came
 * while its sphere stood chosen is read: what ended before the widget opened, or before the sphere was chosen, is
 * history, however late its walks reach the widget.
 */
export function useEndReading(exchanges: WidgetExchange[], aloud: ReadAloud, sphereId: string | null): void {
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

  exchanges
    .flatMap((exchange) => exchange.steps)
    .filter((step) => step.isEnd && !step.isFailure && !queued.current.has(step.id))
    .filter((step) => new Date(step.endedAt).getTime() >= since.current.at)
    .forEach((step) => {
      queued.current.add(step.id);
      waiting.current.push(step);
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
