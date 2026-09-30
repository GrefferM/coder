import { useEffect, useRef, useState } from "react";

/**
 * Turns that arrived while the person was away from the end of the stream: the label on the button down. A run opened
 * from history stays at nought, as nothing arrives in a finished stream.
 */
export function useNewsBelow(arrived: number, isAtEnd: boolean, stream: string | null): number {
  const [seen, setSeen] = useState(arrived);
  const standing = useRef(stream);

  useEffect(() => {
    // Another stream is another count.
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
