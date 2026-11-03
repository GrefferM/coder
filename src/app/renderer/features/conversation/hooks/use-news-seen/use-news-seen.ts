import { useCallback, useEffect, useRef, useState } from "react";
import type { NewsSeen } from "./interfaces";

/** Which words waiting for the hand this session has shown; what stands in the on-screen stream counts as read. */
export function useNewsSeen(elsewhere: string[], onScreen: string[]): NewsSeen {
  /** Words the person has been shown. */
  const [readIds, setReadIds] = useState<string[]>([]);
  // Mirrors the argument: the held hand must read the current words across renders.
  const waiting = useRef(elsewhere);

  waiting.current = elsewhere;

  const markSeen = useCallback((ids: string[]) => {
    setReadIds((was) => {
      const fresh = ids.filter((id) => !was.includes(id));

      return fresh.length === 0 ? was : [...was, ...fresh];
    });
  }, []);

  useEffect(() => markSeen(onScreen));

  return {
    isNewsElsewhere: elsewhere.some((id) => !readIds.includes(id)),
    readNews: useCallback(() => markSeen(waiting.current), [markSeen]),
  };
}
