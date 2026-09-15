import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import type { OpenProject } from "./interfaces";

/** The page's own handles, taken from the mocked pages so the test can open and then switch. */
const held: {
  open: ((project: OpenProject) => void) | null;
  switch: ((project: OpenProject) => void) | null;
} = {
  open: null,
  switch: null,
};

vi.mock("./hooks", () => ({
  useScrollMark: () => undefined,
  useFieldTab: () => undefined,
  useChoiceArrows: () => undefined,
}));

vi.mock("./pages", () => ({
  StartPage: ({ onProjectOpened }: { onProjectOpened: (project: OpenProject) => void }) => {
    held.open = onProjectOpened;

    return <span>ПОЧАТОК</span>;
  },
  // Whatever the page holds, it holds from the moment it was built — as its chat and its view do.
  MainPage: ({ project, setProject }: { project: OpenProject; setProject: (project: OpenProject) => void }) => {
    const [built] = useState(project.directory);

    held.switch = setProject;

    return <span>{`ТРИМАЄ ${built}`}</span>;
  },
}));

function project(directory: string): OpenProject {
  return {
    directory,
    config: {} as OpenProject["config"],
    view: null,
  };
}

describe("App", () => {
  it("builds the page anew for another project, so nothing of the last one flows into it", () => {
    render(<App />);
    act(() => held.open?.(project("/one")));

    expect(screen.getByText("ТРИМАЄ /one")).toBeInTheDocument();

    act(() => held.switch?.(project("/other")));

    // A different folder is a different life on screen: the chat, the opened run and the view go with it.
    expect(screen.getByText("ТРИМАЄ /other")).toBeInTheDocument();
  });

  it("keeps the page as it stands when the same project is read again from its file", () => {
    render(<App />);
    act(() => held.open?.(project("/one")));
    // The file changed on disk and was reread — the same project, so the page is not rebuilt.
    act(() => held.switch?.(project("/one")));

    expect(screen.getByText("ТРИМАЄ /one")).toBeInTheDocument();
  });
});
