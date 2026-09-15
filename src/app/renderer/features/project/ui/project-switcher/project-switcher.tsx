import { useCallback, useState } from "react";
import { useListWalk, useWindowDismiss, useWindowKeydown } from "../../../../hooks";
import { SWITCHER_LAYER } from "../../../../constants";
import { useKnownProjects } from "../../hooks";
import {
  SWITCHER_BUTTON_PATH_FONT_SIZE_PX,
  SWITCHER_ERROR_COLOR,
  SWITCHER_INSET_PX,
  SWITCHER_LIST_GAP_PX,
} from "./constants";
import { NamingOverlay, SwitcherButton, SwitcherList } from "./components";
import type { ProjectSwitcherProps } from "./interfaces";

/** Open project and the way to another; picking a row opens it in place. */
export function ProjectSwitcher({ project, onProjectChange, onClose }: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const { known, error, switchTo, chooseFolder, startProject, naming, nameIt, stopNaming, forget, reveal } =
    useKnownProjects(project, isOpen, onProjectChange, close);

  useWindowDismiss(isOpen, close);

  const others = known.filter((entry) => entry.directory !== project.directory);
  // Everything the list can act on is walked, in the order it is drawn; the open project is not one of them.
  const walkable = [
    ...others.map((entry) => (entry.exists === false ? () => undefined : () => void switchTo(entry.directory))),
    () => void chooseFolder(),
    () => void startProject(),
    onClose,
    () => void reveal(),
  ];
  const walk = useListWalk(walkable.length, isOpen, (index) => walkable[index]());

  // An open list answers Escape itself.
  useWindowKeydown(isOpen, (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);

      return;
    }

    walk.onKeyDown(event);
  });

  return (
    <div
      className="d-flex flex-column"
      style={{
        position: "absolute",
        left: SWITCHER_INSET_PX,
        top: SWITCHER_INSET_PX,
        zIndex: SWITCHER_LAYER,
        gap: SWITCHER_LIST_GAP_PX,
      }}
    >
      <SwitcherButton
        name={project.config.name}
        directory={project.directory}
        isOpen={isOpen}
        onPress={() => setIsOpen((wasOpen) => !wasOpen)}
      />

      {error !== null && (
        <span
          className="font-monospace"
          style={{
            fontSize: SWITCHER_BUTTON_PATH_FONT_SIZE_PX,
            color: SWITCHER_ERROR_COLOR,
          }}
        >
          {error}
        </span>
      )}

      {naming !== null && (
        // A folder chosen anew replaces the one being named, so the typed name starts over with it.
        <NamingOverlay
          key={naming.directory}
          directory={naming.directory}
          suggested={naming.name}
          onCreate={(name) => void nameIt(name)}
          onChooseDirectory={() => void startProject()}
          onCancel={stopNaming}
        />
      )}

      {isOpen && (
        <SwitcherList
          project={project}
          others={others}
          walk={walk}
          onSwitch={(directory) => void switchTo(directory)}
          onForget={(directory) => void forget(directory)}
          onChooseFolder={() => void chooseFolder()}
          onStartProject={() => void startProject()}
          onReveal={() => void reveal()}
          onClose={onClose}
        />
      )}
    </div>
  );
}
