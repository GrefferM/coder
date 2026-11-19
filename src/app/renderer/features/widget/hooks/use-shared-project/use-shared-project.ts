import { useEffect, useRef } from "react";
import { changeWidget, readWidget } from "../../api";
import { openProject } from "../../../project";
import { WIDGET_SETTINGS_CHANGED_CHANNEL } from "../../../../../../contracts";
import type { WidgetSettings } from "../../../../../../contracts";
import type { SharedProjectHands } from "../../interfaces";

/**
 * The main window and the widget hold one project: the main window opens the one the widget names, at its start and
 * whenever the widget opens another, and names its own to the widget whenever it opens or closes one.
 */
export function useSharedProject({ project, onOpened }: SharedProjectHands): void {
  const directory = project?.directory ?? null;
  /** The project the main window last named or took, so neither side echoes the other's change back. */
  const told = useRef<string | null | undefined>(undefined);
  const held = useRef(onOpened);

  held.current = onOpened;

  useEffect(() => {
    const take = ({ directory: named }: WidgetSettings) => {
      if (named === told.current) {
        return;
      }

      told.current = named;

      if (named === null) {
        held.current(null);

        return;
      }

      // A folder the widget names but this window cannot open leaves this window where it stands.
      void openProject(named).then(held.current, () => undefined);
    };

    void readWidget().then(take);

    return window.electronApi.subscribe(WIDGET_SETTINGS_CHANGED_CHANNEL, take);
  }, []);

  useEffect(() => {
    if (told.current === undefined || told.current === directory) {
      return;
    }

    told.current = directory;
    void changeWidget({
      directory,
    });
  }, [directory]);
}
