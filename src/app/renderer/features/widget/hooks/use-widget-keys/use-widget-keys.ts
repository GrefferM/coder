import { useEffect, useRef } from "react";
import { useWindowKeydown } from "../../../../hooks";
import { WIDGET_LISTEN_CHANNEL } from "../../../../../../contracts";
import type { WidgetKeysHands } from "../../interfaces";

/**
 * The widget's two keys. The listening shortcut, pressed in any app: a question begins, the one being said ends and
 * goes, and one being heard is left to its words. Escape, in the widget: a take being said is dropped unheard,
 * otherwise a walk out is stopped and a reading silenced.
 */
export function useWidgetKeys({ voice, isWalking, isAsked, onStopWalk, onStopReading }: WidgetKeysHands): void {
  const listening = useRef(voice);

  listening.current = voice;

  useEffect(
    () =>
      window.electronApi.subscribe(WIDGET_LISTEN_CHANNEL, () => {
        if (listening.current.standing !== "hearing") {
          listening.current.press();
        }
      }),
    [],
  );

  useWindowKeydown(!isAsked, (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (voice.standing === "recording") {
      voice.cancel();

      return;
    }

    if (isWalking) {
      onStopWalk();
    }

    onStopReading();
  });
}
