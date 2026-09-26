import { useCallback, useState } from "react";
import { errorMessage } from "../../../../utils/errors";
import { useUndoOffers } from "../use-undo-offers";
import { forgetDeletion, rememberDeletion, saveProject } from "../../api";
import { takenBetween, withTakenBack } from "../../logic";
import { WRITE_FAILED_PREFIX } from "../../constants";
import type { Dispatch, SetStateAction } from "react";
import type { OpenProject, ProjectConfig } from "../../../../interfaces";
import type { TakenThings, WriteNote } from "../../interfaces";
import type { ProjectWrite } from "./interfaces";
import type { Point } from "../../../../utils/math";

/** Every write to the open project's file goes through here; a deletion also writes the history and offers a way back. */
export function useProjectWrite(
  project: OpenProject,
  setProject: Dispatch<SetStateAction<OpenProject | null>>,
): ProjectWrite {
  // Every deletion's way back stands on its own; a second deletion does not take the first one's down.
  const undo = useUndoOffers();
  // The last write's note, with the config it wrote, so «ще раз» runs that same write.
  const [written, setWritten] = useState<{ note: WriteNote; config: ProjectConfig } | null>(null);

  /** Puts what `change` works out over the open project's config as it stands at that moment. */
  const changeConfig = useCallback(
    (change: (standing: ProjectConfig) => ProjectConfig) =>
      setProject((open) =>
        open === null
          ? open
          : {
              ...open,
              config: change(open.config),
            },
      ),
    [setProject],
  );

  const save = useCallback(
    async (config: ProjectConfig, label?: string, quietly = false) => {
      try {
        await saveProject(project.directory, config);
      } catch (reason) {
        if (label !== undefined) {
          setWritten({
            note: {
              label,
              detail: null,
              reason: `${WRITE_FAILED_PREFIX}${errorMessage(reason)}`,
              isRefusal: false,
            },
            config,
          });
        }

        throw reason;
      }

      changeConfig(() => config);
      setWritten(
        label === undefined || quietly
          ? null
          : {
              note: {
                label,
                detail: null,
                reason: null,
                isRefusal: false,
              },
              config,
            },
      );
    },
    [changeConfig, project.directory],
  );

  /** «ще раз»: the very write that failed, run again. */
  const retryWrite = useCallback(async () => {
    if (written === null) {
      return;
    }

    try {
      await save(written.config, written.note.label);
    } catch {
      // The line already says what stopped it.
    }
  }, [save, written]);

  const defer = useCallback(
    async (without: ProjectConfig, kind: string, name: string, message: string, place: Point | null) => {
      const taken = takenBetween(project.config, without);

      changeConfig(() => without);

      try {
        await save(without, message, true);
      } catch {
        changeConfig((standing) => withTakenBack(standing, taken));

        return;
      }

      const deletionId = await rememberDeletion(project.directory, kind, name, taken).catch(() => null);

      undo.offer({
        deletionId,
        taken,
        message,
        place,
      });
    },
    [changeConfig, project.config, project.directory, save, undo],
  );

  /** Puts a deletion back and lets its history row go, so one thing cannot come back twice. */
  const putBack = useCallback(
    async (taken: TakenThings, deletionId: string | null, label?: string) => {
      const back = withTakenBack(project.config, taken);

      await save(back, label, true);

      if (deletionId !== null) {
        await forgetDeletion(deletionId);
      }
    },
    [project.config, save],
  );

  /** The thing comes back where it stood, and its history row goes. */
  const undoOffer = useCallback(
    async (offerId: string) => {
      const taken = undo.take(offerId);

      if (taken === null) {
        return;
      }

      try {
        await putBack(taken.taken, taken.deletionId, taken.message);
      } catch {
        // The line already says what stopped the write; the thing stays gone and stays in the history.
      }
    },
    [putBack, undo],
  );

  /** ⌘Z takes the newest offer, the one drawn at the bottom of the stack. */
  const undoDelete = useCallback(async () => {
    const newest = undo.offers.at(-1);

    if (newest === undefined) {
      return;
    }

    await undoOffer(newest.id);
  }, [undo.offers, undoOffer]);

  /** The way back taken from the history, not the canvas; the offer goes down with it when it names that deletion. */
  const restoreDeletion = useCallback(
    async (deletionId: string, taken: TakenThings) => {
      await putBack(taken, deletionId);
      undo.takeOfDeletion(deletionId);
    },
    [putBack, undo],
  );

  /** A change that arrived from outside says so on the same line a write does. */
  const sayNote = useCallback(
    (note: WriteNote) =>
      setWritten({
        note,
        config: project.config,
      }),
    [project.config],
  );

  const dismissWriteNote = useCallback(() => setWritten(null), []);

  return {
    save,
    defer,
    writeNote: written?.note ?? null,
    retryWrite,
    sayNote,
    dismissWriteNote,
    undoOffers: undo.offers,
    undoOffer,
    undoDelete,
    restoreDeletion,
  };
}
