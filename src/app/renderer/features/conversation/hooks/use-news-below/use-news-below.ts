import { useEffect, useRef, useState } from "react";

/**
 * How many turns arrived while the person was away from the end of the stream — the label on the button down.
 *
 * A run opened out of the history needs no rule of its own: nothing arrives in a stream that is over, so the
 * number stays at nought, and the moment somebody writes into that run again it is a live stream like any other.
 */
export function useNewsBelow(arrived: number, isAtEnd: boolean, stream: string | null): number {
  const [seen, setSeen] = useState(arrived);
  const standing = useRef(stream);

  useEffect(() => {
    // Another stream is another count: what stood unread in the last one is not news in this one.
    if (standing.current !== stream) {
      standing.current = stream;
      setSeen(arrived);

      return;
    }

    if (isAtEnd) {
      setSeen(arrived);
    }
  }, [arrived, isAtEnd, stream]);

  return standing.current !== stream || isAtEnd ? 0 : Math.max(arrived - seen, 0);
}
