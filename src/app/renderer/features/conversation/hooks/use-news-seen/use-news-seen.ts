import { useCallback, useEffect, useRef, useState } from "react";
import type { NewsSeen } from "./interfaces";

/**
 * News of this session alone: which words waiting for the hand the person has been shown, and which have not.
 *
 * Told every render what waits elsewhere and what waits on screen. What is on screen is read where it is —
 * otherwise turning to another conversation would make news of the word the person had just been reading.
 */
export function useNewsSeen(elsewhere: string[], onScreen: string[]): NewsSeen {
  /** The words the person has already been shown — what is read is no longer news, whatever it says. */
  const [readIds, setReadIds] = useState<string[]>([]);
  // Ref mirrors the argument: the hand below is held by the screen across renders and must read the current words.
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
