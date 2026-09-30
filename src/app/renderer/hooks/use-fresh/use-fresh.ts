import { useEffect, useState } from "react";
import { freshLabel, freshTick } from "../../utils/dates";

/**
 * How fresh a moment is, in the words of the one scale, re-read on its own beat; null for a moment that never happened.
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

    // Re-armed each time: the beat changes as the moment ages.
    const beat = setTimeout(() => setNow(Date.now()), wait);

    return () => clearTimeout(beat);
  }, [at, now]);

  return at === null ? null : freshLabel(at, now);
}
