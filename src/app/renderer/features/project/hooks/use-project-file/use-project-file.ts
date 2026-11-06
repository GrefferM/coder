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

  /** What was read becomes the project, and the line says what changed. */
  const adopt = useCallback(
    (read: OpenProject) => {
      setProject(read);
      sayNote({
        label: PROJECT_REREAD_LABEL,
        detail: fileChangeDetail(project.config, read.config),
        reason: null,
        isRefusal: false,
        act: null,
      });
    },
    [project.config, sayNote, setProject],
  );

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

          adopt(read);
        });
      }),
    [adopt, project.directory],
  );

  /**
   * «Лишити моє» writes nothing: what arrived becomes the project and the draft stays laid over it, so its own save
   * changes only what the draft touched and undoes nothing else that changed on disk.
   */
  const keepMine = useCallback(() => {
    if (arrived !== null) {
      adopt(arrived);
      setArrived(null);
    }
  }, [adopt, arrived]);

  /** «Взяти з диска»: the draft is dropped and what arrived becomes the project. */
  const takeArrived = useCallback(() => {
    if (arrived !== null) {
      unsaved?.discard();
      adopt(arrived);
      setArrived(null);
    }
  }, [adopt, arrived, unsaved]);

  return {
    arrived,
    keepMine,
    takeArrived,
  };
}
