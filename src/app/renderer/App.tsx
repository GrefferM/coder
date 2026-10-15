import { useState } from "react";
import { MainPage, StartPage } from "./pages";
import { useChoiceArrows, useFieldTab, useScrollMark } from "./hooks";
import type { OpenProject } from "./interfaces";

export function App() {
  const [project, setProject] = useState<OpenProject | null>(null);

  useScrollMark();
  // Tab is the fields' key app-wide, start screen included.
  useFieldTab();
  // A row of choices is one tab stop; arrows choose inside it.
  useChoiceArrows();

  if (!project) {
    return <StartPage onProjectOpened={setProject} />;
  }

  // Keyed by folder: another project rebuilds the page and all it holds; rereading the same project's file keeps it.
  return <MainPage key={project.directory} project={project} setProject={setProject} />;
}
