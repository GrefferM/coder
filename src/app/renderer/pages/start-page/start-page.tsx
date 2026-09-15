import { useCallback, useEffect, useState } from "react";
import {
  chooseProjectDirectory,
  createProject,
  forgetProject,
  isProjectNotFound,
  listRecentProjects,
  lookFolder,
  openFolder,
  openProject,
  projectFailureNote,
  withProjectGone,
} from "../../features/project";
import { ActionButton } from "../../components";
import type { ProjectEntry } from "../../interfaces";
import { ProjectForm } from "../../features/project";
import { RecentProjectRow } from "./components";
import {
  NEW_PROJECT_LABEL,
  OPEN_FOLDER_LABEL,
  RECENT_LABEL,
  RECENT_LABEL_COLOR,
  RECENT_LABEL_FONT_SIZE_PX,
  RECENT_LABEL_LETTER_SPACING_PX,
  START_PAGE_ACTIONS_MARGIN_PX,
  START_PAGE_ERROR_COLOR,
  START_PAGE_ACTION_GAP_PX,
  START_PAGE_RECENT_LABEL_GAP_PX,
  START_PAGE_RECENT_MARGIN_PX,
  START_PAGE_ROW_GAP_PX,
  START_PAGE_SUBTITLE,
  START_PAGE_SUBTITLE_COLOR,
  START_PAGE_SUBTITLE_FONT_SIZE_PX,
  START_PAGE_TITLE,
  START_PAGE_TITLE_COLOR,
  START_PAGE_TITLE_FONT_SIZE_PX,
  START_PAGE_TITLE_FONT_WEIGHT,
  START_PAGE_TITLE_GAP_PX,
  START_PAGE_WIDTH_PX,
} from "./constants";
import type { StartPageProps } from "./interfaces";

/** What the app shows with no project open. */
export function StartPage({ onProjectOpened }: StartPageProps) {
  const [recent, setRecent] = useState<ProjectEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  // The folder chosen for a new project, and the name being typed into it.
  const [directory, setDirectory] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    listRecentProjects()
      .then(setRecent)
      .catch((reason: unknown) => setError(projectFailureNote(reason)));
  }, []);

  /** Opens a row's project, marking the row missing when its folder is gone. */
  const open = useCallback(
    async (directory: string) => {
      try {
        onProjectOpened(await openProject(directory));
      } catch (reason) {
        if (isProjectNotFound(reason)) {
          setRecent((entries) => withProjectGone(entries, directory));

          return;
        }

        setError(projectFailureNote(reason));
      }
    },
    [onProjectOpened],
  );

  const chooseFolder = useCallback(async () => {
    const directory = await chooseProjectDirectory();

    if (!directory) {
      return;
    }

    try {
      onProjectOpened(await openFolder(directory));
    } catch (reason) {
      setError(projectFailureNote(reason));
    }
  }, [onProjectOpened]);

  /** Drops a project from the list; the folder itself is left where it is. */
  const forget = useCallback(async (directory: string) => {
    setError(null);

    try {
      await forgetProject(directory);
      setRecent((entries) => entries.filter((entry) => entry.directory !== directory));
    } catch (reason) {
      setError(projectFailureNote(reason));
    }
  }, []);

  /**
   * «Новий проєкт» looks into the chosen folder before it asks anything.
   *
   * A folder that already holds a project has nothing to ask about: the form would stand there with the name it
   * cannot change, a block reading out what is inside, and one button saying «Відкрити» — a question with a single
   * answer. Nothing is created over a project that exists, so the only act left is the one taken straight away.
   * The form stays for the case it was made for: an empty folder, which has to be named before it becomes one.
   */
  const chooseForForm = useCallback(async () => {
    const chosen = await chooseProjectDirectory();

    if (!chosen) {
      return;
    }

    try {
      const held = await lookFolder(chosen);

      if (held.hasProject) {
        onProjectOpened(await openProject(chosen));

        return;
      }

      setDirectory(chosen);
      // The folder's own name is the first guess at the project's, and the person may type over it.
      setName(held.name);
    } catch (reason) {
      setError(projectFailureNote(reason));
    }
  }, [onProjectOpened]);

  const leaveForm = useCallback(() => {
    setDirectory(null);
    setName("");
  }, []);

  /** Submit: the folder is empty by now — the form is only ever opened on one — so this always creates. */
  const submitForm = useCallback(async () => {
    if (directory === null) {
      return;
    }

    try {
      onProjectOpened(await createProject(directory, name.trim()));
    } catch (reason) {
      setError(projectFailureNote(reason));
    }
  }, [directory, name, onProjectOpened]);

  if (directory !== null) {
    return (
      <div className="d-flex flex-fill align-items-center justify-content-center">
        <ProjectForm
          directory={directory}
          name={name}
          onNameChange={setName}
          onChooseDirectory={() => void chooseForForm()}
          onSubmit={() => void submitForm()}
          onCancel={leaveForm}
        />
      </div>
    );
  }

  return (
    <div className="d-flex flex-fill align-items-center justify-content-center">
      <div
        className="d-flex flex-column"
        style={{
          width: START_PAGE_WIDTH_PX,
        }}
      >
        <div
          className="d-flex flex-column"
          style={{
            gap: START_PAGE_TITLE_GAP_PX,
          }}
        >
          <span
            style={{
              fontSize: START_PAGE_TITLE_FONT_SIZE_PX,
              fontWeight: START_PAGE_TITLE_FONT_WEIGHT,
              color: START_PAGE_TITLE_COLOR,
            }}
          >
            {START_PAGE_TITLE}
          </span>
          <span
            style={{
              fontSize: START_PAGE_SUBTITLE_FONT_SIZE_PX,
              color: START_PAGE_SUBTITLE_COLOR,
            }}
          >
            {START_PAGE_SUBTITLE}
          </span>
        </div>

        <div
          className="d-flex"
          style={{
            gap: START_PAGE_ACTION_GAP_PX,
            marginTop: START_PAGE_ACTIONS_MARGIN_PX,
          }}
        >
          <ActionButton variant="save" label={OPEN_FOLDER_LABEL} onClick={chooseFolder} />
          <ActionButton variant="cancel" label={NEW_PROJECT_LABEL} onClick={() => void chooseForForm()} />
        </div>

        <span
          className="font-monospace"
          style={{
            marginTop: START_PAGE_RECENT_MARGIN_PX,
            marginBottom: START_PAGE_RECENT_LABEL_GAP_PX,
            fontSize: RECENT_LABEL_FONT_SIZE_PX,
            letterSpacing: RECENT_LABEL_LETTER_SPACING_PX,
            color: RECENT_LABEL_COLOR,
          }}
        >
          {RECENT_LABEL}
        </span>

        <div
          className="d-flex flex-column"
          style={{
            gap: START_PAGE_ROW_GAP_PX,
          }}
        >
          {recent.map((entry) => (
            <RecentProjectRow
              key={entry.id}
              entry={entry}
              onOpen={open}
              onForget={(directory) => void forget(directory)}
            />
          ))}
        </div>

        {error && (
          <span
            className="font-monospace"
            style={{
              marginTop: START_PAGE_RECENT_LABEL_GAP_PX,
              fontSize: RECENT_LABEL_FONT_SIZE_PX,
              letterSpacing: RECENT_LABEL_LETTER_SPACING_PX,
              color: START_PAGE_ERROR_COLOR,
            }}
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
