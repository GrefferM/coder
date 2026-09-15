import { useState } from "react";
import { MainPage, StartPage } from "./pages";
import { useChoiceArrows, useFieldTab, useScrollMark } from "./hooks";
import type { OpenProject } from "./interfaces";

/** Shows `StartPage` until a project is open, then `MainPage`. */
export function App() {
  const [project, setProject] = useState<OpenProject | null>(null);

  useScrollMark();
  // One law for the whole app, start screen included: Tab is the fields' key and nothing else's.
  useFieldTab();
  // And the other half of that law: a row of choices is one stop, and inside it the arrows choose.
  useChoiceArrows();

  if (!project) {
    return <StartPage onProjectOpened={setProject} />;
  }

  /**
   * The page is keyed by the folder, so picking another project builds it anew: everything the page holds — the chat in
   * memory, the opened run, the selection, the view — belongs to one project. Rereading the same project's file keeps
   * the key, and the page as it stands.
   */
  return <MainPage key={project.directory} project={project} setProject={setProject} />;
}
