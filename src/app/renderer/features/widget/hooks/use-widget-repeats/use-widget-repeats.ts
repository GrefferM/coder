import { useCallback, useEffect, useRef, useState } from "react";
import { REPEAT_LEAST } from "../../../conversation";
import type { PackedAttachment } from "../../../../../../contracts";
import type { RepeatCycle, WidgetRepeats, WidgetRepeatsHands } from "../../interfaces";

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
  const isOut = cycle !== null && isOutOf(cycle.agentId);

  /** Puts one question; one that did not go ends the repeats. */
  const goes = useCallback(
    async (agentId: string, text: string, attached: PackedAttachment[]) => {
      const went = await put(agentId, text, attached);

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
    void goes(cycle.agentId, cycle.text, cycle.attached);
  }, [isOut, cycle, goes]);

  const send = useCallback(
    async (agentId: string, text: string, attached: PackedAttachment[]) => {
      isAwaiting.current = true;
      setCycle(
        repeats > REPEAT_LEAST
          ? {
              agentId,
              text,
              attached,
              sent: 1,
              total: repeats,
            }
          : null,
      );

      return goes(agentId, text, attached);
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
