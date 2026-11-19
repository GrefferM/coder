import { useEffect, useRef } from "react";
import type { ReadAloud } from "../../../speech";
import type { WidgetExchange, WidgetStep } from "../../interfaces";

/**
 * Reads each end of a walk aloud as it arrives, one after another in the order they ended (52h); ends already
 * standing when the widget opened are history and are not read.
 */
export function useEndReading(exchanges: WidgetExchange[], aloud: ReadAloud): void {
  /** Every end the widget has seen, read or not, by the answer's id. */
  const seen = useRef<Set<string> | null>(null);
  /** Ends waiting for the voice, oldest first. */
  const waiting = useRef<WidgetStep[]>([]);
  const ends = exchanges.flatMap((exchange) => exchange.steps.filter((step) => step.isEnd && !step.isFailure));

  if (seen.current === null) {
    seen.current = new Set(ends.map((step) => step.id));
  }

  ends
    .filter((step) => !seen.current?.has(step.id))
    .forEach((step) => {
      seen.current?.add(step.id);
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
