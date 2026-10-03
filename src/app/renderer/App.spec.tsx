import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import type { OpenProject } from "./interfaces";

/** Handles to the mocked pages, so the test can open and then switch. */
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
  // State the page holds from construction, like its chat and view.
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
    print: "print-1",
    view: null,
  };
}

describe("App", () => {
  it("builds the page anew for another project, so nothing of the last one flows into it", () => {
    render(<App />);
    act(() => held.open?.(project("/one")));

    expect(screen.getByText("ТРИМАЄ /one")).toBeInTheDocument();

    act(() => held.switch?.(project("/other")));

    // A different folder resets the chat, opened run and view.
    expect(screen.getByText("ТРИМАЄ /other")).toBeInTheDocument();
  });

  it("keeps the page as it stands when the same project is read again from its file", () => {
    render(<App />);
    act(() => held.open?.(project("/one")));
    // A file reread for the same project does not rebuild the page.
    act(() => held.switch?.(project("/one")));

    expect(screen.getByText("ТРИМАЄ /one")).toBeInTheDocument();
  });
});
