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
 * What the switcher knows and can do — the machine's own list of projects, read while the list
 * stands open, and the acts over it. Every act says its own failure in words and never throws at the drawing.
 */
export function useKnownProjects(
  project: OpenProject,
  isOpen: boolean,
  onProjectChange: (opened: OpenProject) => void,
  onDone: () => void,
): KnownProjects {
  const [known, setKnown] = useState<ProjectEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  // The empty folder a new project is being named into, and the first guess at that name.
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
   * «Новий проєкт» is not the same act as «Відкрити папку», though both begin with the same picker.
   *
   * A folder that already holds a project is opened where it stands: nothing is ever created over one, so there is
   * nothing to ask. An empty folder is where the two acts part — it is about to become a project, and a project is
   * named by the person, not by whatever the folder happened to be called. So it waits here for the form.
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

        // The folder is gone from the disk, and the row says so instead of the list saying nothing.
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
