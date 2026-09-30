import { useCallback, useEffect, useState } from "react";
import {
  chooseProjectDirectory,
  createProject,
  forgetProject,
  listRecentProjects,
  lookFolder,
  openFolder,
  openProject,
  revealProject,
} from "../../api";
import { isProjectNotFound, withProjectGone } from "../../logic";
import { projectFailureNote } from "../../words";
import type { KnownProjects } from "./interfaces";
import type { OpenProject, ProjectEntry } from "../../../../interfaces";

/**
 * The switcher's state and acts: the machine's list of projects, read while the list is open. Every act reports its
 * failure in words and never throws into rendering.
 */
export function useKnownProjects(
  project: OpenProject,
  isOpen: boolean,
  onProjectChange: (opened: OpenProject) => void,
  onDone: () => void,
): KnownProjects {
  const [known, setKnown] = useState<ProjectEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  // The empty folder being named as a new project, and the first guess at the name.
  const [naming, setNaming] = useState<{ directory: string; name: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    listRecentProjects()
      .then(setKnown)
      .catch((reason: unknown) => setError(projectFailureNote(reason)));
  }, [isOpen, project.directory]);

  /** Every list action closes the list first and reports its own failure. */
  const run = useCallback(
    async (action: () => Promise<void>) => {
      onDone();
      setError(null);

      try {
        await action();
      } catch (reason) {
        setError(projectFailureNote(reason));
      }
    },
    [onDone],
  );

  const openChosen = () =>
    run(async () => {
      const directory = await chooseProjectDirectory();

      if (directory) {
        onProjectChange(await openFolder(directory));
      }
    });

  /**
   * «Новий проєкт» differs from «Відкрити папку» only for an empty folder: it waits here for the person to name the
   * project. A folder already holding a project is opened as is.
   */
  const startChosen = () =>
    run(async () => {
      const directory = await chooseProjectDirectory();

      if (!directory) {
        return;
      }

      const held = await lookFolder(directory);

      if (held.hasProject) {
        onProjectChange(await openProject(directory));

        return;
      }

      setNaming({
        directory,
        name: held.name,
      });
    });

  return {
    known,
    error,
    naming,
    nameIt: async (name: string) => {
      if (naming === null) {
        return;
      }

      setError(null);

      try {
        onProjectChange(await createProject(naming.directory, name.trim()));
        setNaming(null);
      } catch (reason) {
        setError(projectFailureNote(reason));
      }
    },
    stopNaming: () => setNaming(null),
    switchTo: async (directory: string) => {
      setError(null);

      try {
        onProjectChange(await openProject(directory));
        onDone();
      } catch (reason) {
        if (!isProjectNotFound(reason)) {
          setError(projectFailureNote(reason));

          return;
        }

        // The folder is gone from disk; the row says so.
        setKnown((entries) => withProjectGone(entries, directory));
      }
    },
    chooseFolder: openChosen,
    startProject: startChosen,
    forget: async (directory: string) => {
      setError(null);

      try {
        await forgetProject(directory);
        setKnown((entries) => entries.filter((entry) => entry.directory !== directory));
      } catch (reason) {
        setError(projectFailureNote(reason));
      }
    },
    reveal: () => run(() => revealProject(project.directory)),
  };
}
