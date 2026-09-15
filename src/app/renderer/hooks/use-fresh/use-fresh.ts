import { useEffect, useState } from "react";
import { freshLabel, freshTick } from "../../utils/dates";

/**
 * How fresh a moment is, in the words of the one scale, kept true by the beat of its own step. Nothing
 * at all for a moment that never happened — «Відповів …» is a fact about an answer, and where there was no
 * answer the whole line goes rather than standing with a dash.
 */
export function useFresh(at: number | null): string | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (at === null) {
      return undefined;
    }

    const wait = freshTick(at, now);

    if (wait === null) {
      return undefined;
    }

    // Re-armed rather than set once: the step changes as the moment ages, and with it the beat it is read by.
    const beat = setTimeout(() => setNow(Date.now()), wait);

    return () => clearTimeout(beat);
  }, [at, now]);

  return at === null ? null : freshLabel(at, now);
}
