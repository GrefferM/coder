import { useCallback, useEffect, useRef, useState } from "react";
import { REPEAT_LEAST } from "../../../conversation";
import type { RepeatCycle, WidgetQuestion, WidgetRepeats, WidgetRepeatsHands } from "../../interfaces";

/**
 * «x1» in the widget, as in the chat: the question goes, and once its walk has ended it goes again to the same sphere,
 * whichever is chosen meanwhile, until it went as many times as the count. «ЗУПИНИТИ», or a repeat that does not go,
 * ends the repeats.
 */
export function useWidgetRepeats({ isOutOf, put }: WidgetRepeatsHands): WidgetRepeats {
  const [repeats, setRepeats] = useState(REPEAT_LEAST);
  const [cycle, setCycle] = useState<RepeatCycle | null>(null);
  /** A question was put and its walk has not been seen out yet, so its end is not mistaken for the last one's. */
  const isAwaiting = useRef(false);
  const isOut = cycle !== null && isOutOf(cycle.question.agentId);

  /** Puts one question; one that did not go ends the repeats. */
  const goes = useCallback(
    async (question: WidgetQuestion) => {
      const went = await put(question);

      if (!went) {
        isAwaiting.current = false;
        setCycle(null);
      }

      return went;
    },
    [put],
  );

  useEffect(() => {
    if (isOut) {
      isAwaiting.current = false;

      return;
    }

    if (isAwaiting.current || cycle === null) {
      return;
    }

    if (cycle.sent >= cycle.total) {
      setCycle(null);

      return;
    }

    isAwaiting.current = true;
    setCycle({
      ...cycle,
      sent: cycle.sent + 1,
    });
    void goes(cycle.question);
  }, [isOut, cycle, goes]);

  const send = useCallback(
    async (question: WidgetQuestion) => {
      isAwaiting.current = true;
      // What was said is said once: a repeat goes as words alone.
      setCycle(
        repeats > REPEAT_LEAST
          ? {
              question: {
                ...question,
                clips: [],
              },
              sent: 1,
              total: repeats,
            }
          : null,
      );

      return goes(question);
    },
    [goes, repeats],
  );

  const drop = useCallback(() => {
    setCycle(null);
  }, []);

  return {
    repeats,
    repeating:
      cycle === null
        ? null
        : {
            sent: cycle.sent,
            total: cycle.total,
          },
    setRepeats,
    send,
    drop,
  };
}
