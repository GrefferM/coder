import { useCallback, useState } from "react";
import { chooseProjectDirectory, forgetProject, listRecentProjects } from "../../../project";
import type { ProjectEntry } from "../../../../interfaces";
import type { WidgetProjects } from "../../interfaces";

/** The recent projects under the widget's lists: read when a list opens, one opened, one forgotten. */
export function useWidgetProjects(onOpen: (directory: string) => Promise<void>): WidgetProjects {
  const [recent, setRecent] = useState<ProjectEntry[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);

  const load = useCallback(() => void listRecentProjects().then(setRecent), []);
  const open = (directory: string) => {
    setIsListOpen(false);
    void onOpen(directory);
  };

  return {
    recent,
    isListOpen,
    toggleList: () => {
      if (!isListOpen) {
        load();
      }

      setIsListOpen(!isListOpen);
    },
    load,
    open,
    openFolder: () => {
      void chooseProjectDirectory().then((picked) => {
        if (picked !== null) {
          open(picked);
        }
      });
    },
    forget: (directory) => void forgetProject(directory).then(load),
  };
}
