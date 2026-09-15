import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHOOSE_DIRECTORY_CHANNEL } from "../../../../contracts";
import {
  CREATE_PROJECT_CHANNEL,
  FORGET_PROJECT_CHANNEL,
  LIST_RECENT_PROJECTS_CHANNEL,
  LOOK_PROJECT_CHANNEL,
  OPEN_OR_CREATE_PROJECT_CHANNEL,
  OPEN_PROJECT_CHANNEL,
} from "../../../../contracts";
import type { ProjectEntry } from "../../interfaces";
import { OPEN_FOLDER_LABEL } from "./constants";
import { StartPage } from "./start-page";
import { standInBridge } from "../../testing";

const ENTRY: ProjectEntry = {
  id: "entry-1",
  name: "coder-app",
  directory: "/Users/olena/code/coder-app",
  openedAt: new Date().toISOString(),
  exists: true,
  agentCount: 4,
};

function stubApi(handlers: Record<string, (payload?: unknown) => unknown>) {
  const invoke = vi.fn();

  invoke.mockImplementation(async (channel: string, payload?: unknown) => handlers[channel]?.(payload) ?? null);
  standInBridge({
    invoke,
  });

  return invoke;
}

describe("StartPage", () => {
  beforeEach(() => {
    stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [],
    });
  });

  it("lists every project this machine has opened", async () => {
    stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [ENTRY],
    });

    render(<StartPage onProjectOpened={() => {}} />);

    await screen.findByText("coder-app");

    expect(screen.getByText(ENTRY.directory)).toBeInTheDocument();
  });

  it("opens a project straight from the recent list", async () => {
    const invoke = stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [ENTRY],
      [OPEN_PROJECT_CHANNEL]: () => ({
        name: "coder-app",
      }),
    });
    const onProjectOpened = vi.fn();

    render(<StartPage onProjectOpened={onProjectOpened} />);
    await userEvent.click(await screen.findByText("coder-app"));

    expect(invoke).toHaveBeenCalledWith(OPEN_PROJECT_CHANNEL, {
      directory: ENTRY.directory,
    });
    expect(onProjectOpened).toHaveBeenCalled();
  });

  it("asks for a folder before opening one", async () => {
    const invoke = stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [],
      [CHOOSE_DIRECTORY_CHANNEL]: () => "/tmp/picked",
      [OPEN_OR_CREATE_PROJECT_CHANNEL]: () => ({
        name: "picked",
      }),
    });

    render(<StartPage onProjectOpened={() => {}} />);
    await userEvent.click(screen.getByText(OPEN_FOLDER_LABEL));

    expect(invoke).toHaveBeenCalledWith(CHOOSE_DIRECTORY_CHANNEL);
    expect(invoke).toHaveBeenCalledWith(OPEN_OR_CREATE_PROJECT_CHANNEL, {
      directory: "/tmp/picked",
    });
  });

  it("does nothing at all when the folder chooser is dismissed", async () => {
    const invoke = stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [],
      [CHOOSE_DIRECTORY_CHANNEL]: () => null,
    });

    render(<StartPage onProjectOpened={() => {}} />);
    await userEvent.click(screen.getByText("Новий проєкт"));

    expect(invoke).not.toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, expect.anything());
  });

  it("opens the form on the chosen folder, named after it, and writes nothing until the form says so", async () => {
    const invoke = stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [],
      [CHOOSE_DIRECTORY_CHANNEL]: () => "/Users/olena/code/release-bot",
      [LOOK_PROJECT_CHANNEL]: () => ({
        hasProject: false,
        name: "release-bot",
        agentCount: 0,
        linkCount: 0,
        promptCount: 0,
      }),
      [CREATE_PROJECT_CHANNEL]: () => ({
        name: "release-bot",
      }),
    });

    render(<StartPage onProjectOpened={() => {}} />);
    await userEvent.click(screen.getByText("Новий проєкт"));

    expect(invoke).not.toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, expect.anything());

    await userEvent.click(screen.getByText("Створити"));

    expect(invoke).toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, {
      directory: "/Users/olena/code/release-bot",
      name: "release-bot",
    });
  });

  it("opens a folder that already holds a project without asking anything", async () => {
    // Nothing is ever created over a project that exists, so a form whose one answer is «Відкрити» asks nothing.
    const invoke = stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [],
      [CHOOSE_DIRECTORY_CHANNEL]: () => "/Users/olena/code/coder-app",
      [LOOK_PROJECT_CHANNEL]: () => ({
        hasProject: true,
        name: "coder-app",
        agentCount: 10,
        linkCount: 9,
        promptCount: 3,
      }),
      [OPEN_PROJECT_CHANNEL]: () => ({
        name: "coder-app",
      }),
    });

    render(<StartPage onProjectOpened={() => {}} />);
    await userEvent.click(screen.getByText("Новий проєкт"));

    expect(invoke).toHaveBeenCalledWith(OPEN_PROJECT_CHANNEL, {
      directory: "/Users/olena/code/coder-app",
    });
    expect(invoke).not.toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, expect.anything());
    expect(screen.queryByText("Створити")).not.toBeInTheDocument();
  });

  it("shows what went wrong instead of pretending a project opened", async () => {
    stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [ENTRY],
      [OPEN_PROJECT_CHANNEL]: () => {
        throw new Error("ENOENT: no such file or directory");
      },
    });

    render(<StartPage onProjectOpened={() => {}} />);
    await userEvent.click(await screen.findByText("coder-app"));

    expect(await screen.findByText(/ENOENT/)).toBeInTheDocument();
  });

  it("makes a project out of a chosen folder rather than refusing one that has none", async () => {
    const invoke = stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [],
      [CHOOSE_DIRECTORY_CHANNEL]: () => "/Users/olena/projects/test",
      [OPEN_OR_CREATE_PROJECT_CHANNEL]: () => ({
        version: 1,
        name: "test",
        models: [],
        prompts: [],
        agents: [],
        links: [],
      }),
    });

    render(<StartPage onProjectOpened={() => {}} />);
    await userEvent.click(screen.getByText(OPEN_FOLDER_LABEL));

    expect(invoke).toHaveBeenCalledWith(OPEN_OR_CREATE_PROJECT_CHANNEL, {
      directory: "/Users/olena/projects/test",
    });
  });

  it("says a project is not there rather than showing a path that leads nowhere", async () => {
    stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [
        {
          ...ENTRY,
          exists: false,
        },
      ],
    });

    render(<StartPage onProjectOpened={() => {}} />);

    expect(await screen.findByText("НЕ ЗНАЙДЕНО")).toBeInTheDocument();
    expect(screen.queryByText(ENTRY.directory)).not.toBeInTheDocument();
  });

  it("drops a project from the list, leaving its folder where it is", async () => {
    const invoke = stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [ENTRY],
    });

    render(<StartPage onProjectOpened={() => {}} />);
    await userEvent.click(await screen.findByLabelText("Прибрати зі списку"));

    expect(invoke).toHaveBeenCalledWith(FORGET_PROJECT_CHANNEL, {
      directory: ENTRY.directory,
    });
    expect(screen.queryByText(ENTRY.name)).not.toBeInTheDocument();
  });

  it("greys a row whose folder has gone since the list was drawn, instead of saying ENOENT", async () => {
    stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [ENTRY],
      [OPEN_PROJECT_CHANNEL]: () => {
        throw new Error("Error invoking remote method 'projects:open': Error: PROJECT_NOT_FOUND");
      },
    });

    render(<StartPage onProjectOpened={() => {}} />);
    await userEvent.click(await screen.findByText(ENTRY.name));

    expect(await screen.findByText("НЕ ЗНАЙДЕНО")).toBeInTheDocument();
    expect(screen.queryByText(/PROJECT_NOT_FOUND/)).not.toBeInTheDocument();
  });

  it("says how many agents a project holds beside when it was last opened", async () => {
    stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: () => [ENTRY],
    });

    render(<StartPage onProjectOpened={() => {}} />);

    expect(await screen.findByText(/4 АГЕНТИ/)).toBeInTheDocument();
  });
});
