import { useEffect, useRef } from "react";
import { changeWidget, readWidget } from "../../api";
import { WIDGET_SETTINGS_CHANGED_CHANNEL } from "../../../../../../contracts";
import type { WidgetSettings } from "../../../../../../contracts";
import type { SharedSphereHands } from "../../interfaces";

/**
 * The chat's aim and the widget's chosen sphere are one: a sphere chosen in the widget aims the chat, and an agent the
 * chat is aimed at becomes the widget's sphere.
 */
export function useSharedSphere({ directory, aimedAgentId, aim }: SharedSphereHands): void {
  /** Every project's chosen sphere as last told, so a change is laid over the others and never echoed back. */
  const chosen = useRef<Record<string, string> | null>(null);
  const held = useRef(aim);

  held.current = aim;

  useEffect(() => {
    const take = (settings: WidgetSettings) => {
      const named = settings.chosen[directory] ?? null;

      chosen.current = settings.chosen;

      if (named !== null) {
        held.current(named);
      }
    };

    void readWidget().then(take);

    return window.electronApi.subscribe(WIDGET_SETTINGS_CHANGED_CHANNEL, take);
  }, [directory]);

  useEffect(() => {
    const told = chosen.current;

    if (told === null || aimedAgentId === null || told[directory] === aimedAgentId) {
      return;
    }

    const next = {
      ...told,
      [directory]: aimedAgentId,
    };

    chosen.current = next;
    void changeWidget({
      chosen: next,
    });
  }, [directory, aimedAgentId]);
}
