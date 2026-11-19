import { useCallback, useEffect, useRef, useState } from "react";
import { REPEAT_LEAST } from "../../../conversation";
import type { PackedAttachment } from "../../../../../../contracts";
import type { RepeatCycle, WidgetRepeats, WidgetRepeatsHands } from "../../interfaces";

/**
 * «x1» in the widget, as in the chat: the question goes, and once its walk has ended it goes again, until it went as
 * many times as the count. «ЗУПИНИТИ» ends the repeats with the walk.
 */
export function useWidgetRepeats({ isOut, put }: WidgetRepeatsHands): WidgetRepeats {
  const [repeats, setRepeats] = useState(REPEAT_LEAST);
  const [cycle, setCycle] = useState<RepeatCycle | null>(null);
  /** A question was put and its walk has not been seen out yet, so its end is not mistaken for the last one's. */
  const isAwaiting = useRef(false);

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
    void put(cycle.text, cycle.attached).then((went) => {
      if (!went) {
        isAwaiting.current = false;
        setCycle(null);
      }
    });
  }, [isOut, cycle, put]);

  const send = useCallback(
    async (text: string, attached: PackedAttachment[]) => {
      isAwaiting.current = true;
      setCycle(
        repeats > REPEAT_LEAST
          ? {
              text,
              attached,
              sent: 1,
              total: repeats,
            }
          : null,
      );

      const went = await put(text, attached);

      if (!went) {
        isAwaiting.current = false;
        setCycle(null);
      }

      return went;
    },
    [put, repeats],
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
