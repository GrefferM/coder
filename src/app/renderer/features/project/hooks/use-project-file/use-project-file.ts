import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECT_CHANGED_CHANNEL } from "../../../../../../contracts";
import { PROJECT_REREAD_LABEL } from "./constants";
import { openProject } from "../../api";
import { fileChangeDetail } from "../../words";
import type { Dispatch, SetStateAction } from "react";
import type { OpenProject, UnsavedWork } from "../../../../interfaces";
import type { WriteNote } from "../../interfaces";
import type { ProjectFileState } from "./interfaces";

/** The project file changed externally: re-read unless a draft stands, in which case ask. */
export function useProjectFile(
  project: OpenProject,
  setProject: Dispatch<SetStateAction<OpenProject | null>>,
  unsaved: UnsavedWork | null,
  sayNote: (note: WriteNote) => void,
): ProjectFileState {
  const [arrived, setArrived] = useState<OpenProject | null>(null);
  // The draft the subscription reads, in a ref so it does not re-subscribe.
  const draft = useRef(unsaved);

  useEffect(() => {
    draft.current = unsaved;
  }, [unsaved]);

  useEffect(
    () =>
      window.electronApi.subscribe(PROJECT_CHANGED_CHANNEL, (changed) => {
        if (changed.directory !== project.directory) {
          return;
        }

        void openProject(project.directory).then((read) => {
          if (draft.current !== null) {
            setArrived(read);

            return;
          }

          setProject(read);
          sayNote({
            label: PROJECT_REREAD_LABEL,
            detail: fileChangeDetail(project.config, read.config),
            reason: null,
            isRefusal: false,
          });
        });
      }),
    [project.config, project.directory, sayNote, setProject],
  );

  /** «Лишити моє» writes nothing; it dismisses the question and the draft is written with its own save. */
  const keepMine = useCallback(() => setArrived(null), []);

  /** «Взяти з диска»: the draft is dropped and what arrived becomes the project. */
  const takeArrived = useCallback(() => {
    if (arrived === null) {
      return;
    }

    unsaved?.discard();
    setProject(arrived);
    setArrived(null);
    sayNote({
      label: PROJECT_REREAD_LABEL,
      detail: fileChangeDetail(project.config, arrived.config),
      reason: null,
      isRefusal: false,
    });
  }, [arrived, project.config, sayNote, setProject, unsaved]);

  return {
    arrived,
    keepMine,
    takeArrived,
  };
}
