import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectSwitcher } from "./project-switcher";
import {
  SWITCHER_CLOSE_LABEL,
  SWITCHER_LIST_LABEL,
  SWITCHER_LIST_MAX_HEIGHT_PX,
  SWITCHER_LIST_SHOWN_MAX,
  SWITCHER_NEW_PROJECT_LABEL,
  SWITCHER_OPEN_FOLDER_LABEL,
  SWITCHER_REVEAL_LABEL,
} from "./constants";
import { INTERACTION_HOVER_BACKGROUND_COLOR } from "../../../../constants";
import {
  CREATE_PROJECT_CHANNEL,
  LIST_RECENT_PROJECTS_CHANNEL,
  LOOK_PROJECT_CHANNEL,
  OPEN_PROJECT_CHANNEL,
  FORGET_PROJECT_CHANNEL,
} from "../../../../../../contracts";
import { CHOOSE_DIRECTORY_CHANNEL, REVEAL_PROJECT_CHANNEL } from "../../../../../../contracts";
import { PROJECT_FORM_CREATE_LABEL } from "../project-form/constants";
import type { OpenProject } from "../../../../interfaces";
import { aConfig, standInBridge } from "../../../../testing";

const CONFIG = aConfig({
  name: "coder-app",
});

const PROJECT: OpenProject = {
  directory: "/code/coder-app",
  config: CONFIG,
  print: "print-1",
  view: null,
};

const KNOWN = [
  {
    id: "1",
    name: "coder-app",
    directory: "/code/coder-app",
    openedAt: "2026-08-13T00:00:00.000Z",
    exists: true,
    agentCount: 4,
  },
  {
    id: "2",
    name: "docs-pipeline",
    directory: "/work/docs-pipeline",
    openedAt: "2026-08-12T00:00:00.000Z",
    exists: true,
    agentCount: 4,
  },
];

function stubApi(overrides: Record<string, unknown> = {}) {
  const invoke = vi.fn();

  invoke.mockImplementation(async (channel: string) => {
    if (channel in overrides) {
      return overrides[channel];
    }

    return channel === LIST_RECENT_PROJECTS_CHANNEL ? KNOWN : undefined;
  });
  standInBridge({
    invoke,
  });

  return invoke;
}

async function openList(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", {
      name: "coder-app",
    }),
  );

  return screen.findByRole("menu");
}

describe("ProjectSwitcher", () => {
  it("names the open project and its folder without being opened", () => {
    stubApi();

    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);

    expect(screen.getByText("coder-app")).toBeInTheDocument();
    expect(screen.getByText("/code/coder-app")).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("lists the projects it knows, the open one first and marked", async () => {
    const user = userEvent.setup();

    stubApi();
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);

    expect(screen.getByText(SWITCHER_LIST_LABEL)).toBeInTheDocument();
    expect(await screen.findByText("docs-pipeline")).toBeInTheDocument();

    const [current] = screen.getAllByRole("menuitem");

    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toBeDisabled();
  });

  it("opens another project where you are, without the start screen", async () => {
    const user = userEvent.setup();
    const onProjectChange = vi.fn();

    stubApi({
      [OPEN_PROJECT_CHANNEL]: {
        config: {
          ...CONFIG,
          name: "docs-pipeline",
        },
        print: "print-1",
      },
    });
    render(<ProjectSwitcher project={PROJECT} onProjectChange={onProjectChange} onClose={() => {}} />);
    await openList(user);
    await user.click(await screen.findByText("docs-pipeline"));

    expect(onProjectChange).toHaveBeenCalledWith({
      directory: "/work/docs-pipeline",
      config: expect.objectContaining({
        name: "docs-pipeline",
      }),
      print: "print-1",
      // No note for that folder: the project opens at home.
      view: null,
    });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("offers a folder to open and a project to start, both asking for a folder first", async () => {
    const user = userEvent.setup();
    const invoke = stubApi({
      [CHOOSE_DIRECTORY_CHANNEL]: null,
    });

    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);
    await user.click(screen.getByText(SWITCHER_OPEN_FOLDER_LABEL));

    expect(invoke).toHaveBeenCalledWith(CHOOSE_DIRECTORY_CHANNEL);

    await openList(user);
    await user.click(screen.getByText(SWITCHER_NEW_PROJECT_LABEL));

    const asked = invoke.mock.calls.filter(([channel]) => channel === CHOOSE_DIRECTORY_CHANNEL);

    expect(asked).toHaveLength(2);
  });

  it("opens a folder that already holds a project instead of asking to name one", async () => {
    const user = userEvent.setup();
    const onProjectChange = vi.fn();
    const invoke = stubApi({
      [CHOOSE_DIRECTORY_CHANNEL]: "/work/docs-pipeline",
      [LOOK_PROJECT_CHANNEL]: {
        hasProject: true,
        name: "docs-pipeline",
        agentCount: 2,
        linkCount: 1,
        promptCount: 0,
      },
      [OPEN_PROJECT_CHANNEL]: {
        config: CONFIG,
        print: "print-1",
      },
    });

    render(<ProjectSwitcher project={PROJECT} onProjectChange={onProjectChange} onClose={() => {}} />);
    await openList(user);
    await user.click(screen.getByText(SWITCHER_NEW_PROJECT_LABEL));

    expect(invoke).toHaveBeenCalledWith(OPEN_PROJECT_CHANNEL, {
      directory: "/work/docs-pipeline",
    });
    expect(invoke).not.toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, expect.anything());
    expect(screen.queryByText(PROJECT_FORM_CREATE_LABEL)).not.toBeInTheDocument();
  });

  it("asks for a name over the open project when the chosen folder is empty", async () => {
    // The person names the project, and the canvas underneath stays open.
    const user = userEvent.setup();
    const onProjectChange = vi.fn();
    const invoke = stubApi({
      [CHOOSE_DIRECTORY_CHANNEL]: "/work/release-bot",
      [LOOK_PROJECT_CHANNEL]: {
        hasProject: false,
        name: "release-bot",
        agentCount: 0,
        linkCount: 0,
        promptCount: 0,
      },
      [CREATE_PROJECT_CHANNEL]: {
        config: CONFIG,
        print: "print-1",
      },
    });

    render(<ProjectSwitcher project={PROJECT} onProjectChange={onProjectChange} onClose={() => {}} />);
    await openList(user);
    await user.click(screen.getByText(SWITCHER_NEW_PROJECT_LABEL));

    expect(await screen.findByDisplayValue("release-bot")).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, expect.anything());

    await user.click(screen.getByText(PROJECT_FORM_CREATE_LABEL));

    expect(invoke).toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, {
      directory: "/work/release-bot",
      name: "release-bot",
    });
    expect(onProjectChange).toHaveBeenCalled();
  });

  it("leaves the open project where it was when the naming is called off", async () => {
    const user = userEvent.setup();
    const onProjectChange = vi.fn();
    const invoke = stubApi({
      [CHOOSE_DIRECTORY_CHANNEL]: "/work/release-bot",
      [LOOK_PROJECT_CHANNEL]: {
        hasProject: false,
        name: "release-bot",
        agentCount: 0,
        linkCount: 0,
        promptCount: 0,
      },
    });

    render(<ProjectSwitcher project={PROJECT} onProjectChange={onProjectChange} onClose={() => {}} />);
    await openList(user);
    await user.click(screen.getByText(SWITCHER_NEW_PROJECT_LABEL));
    await screen.findByDisplayValue("release-bot");
    await user.keyboard("{Escape}");

    expect(screen.queryByText(PROJECT_FORM_CREATE_LABEL)).not.toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalledWith(CREATE_PROJECT_CHANNEL, expect.anything());
    expect(onProjectChange).not.toHaveBeenCalled();
  });

  it("shows the open project's folder in the file manager", async () => {
    const user = userEvent.setup();
    const invoke = stubApi();

    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);
    await user.click(screen.getByText(SWITCHER_REVEAL_LABEL));

    expect(invoke).toHaveBeenCalledWith(REVEAL_PROJECT_CHANNEL, "/code/coder-app");
  });

  it("says why rather than doing nothing when a project cannot be opened", async () => {
    const user = userEvent.setup();
    const invoke = vi.fn();

    invoke.mockImplementation(async (channel: string) => {
      if (channel === LIST_RECENT_PROJECTS_CHANNEL) {
        return KNOWN;
      }

      throw new Error("Тут немає проєкту.");
    });
    standInBridge({
      invoke,
    });

    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);
    await user.click(await screen.findByText("docs-pipeline"));

    expect(await screen.findByText("Тут немає проєкту.")).toBeInTheDocument();
  });

  it("says a project is not there rather than offering to open it", async () => {
    const user = userEvent.setup();

    stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: [
        KNOWN[0],
        {
          ...KNOWN[1],
          exists: false,
        },
      ],
    });
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);

    expect(await screen.findByText("НЕ ЗНАЙДЕНО")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", {
        name: /docs-pipeline/,
      }),
    ).toBeDisabled();
  });

  it("drops a project from the list without closing it", async () => {
    const user = userEvent.setup();
    const invoke = stubApi();

    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);
    await user.click(await screen.findByLabelText("Прибрати зі списку"));

    expect(invoke).toHaveBeenCalledWith(FORGET_PROJECT_CHANNEL, {
      directory: "/work/docs-pipeline",
    });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.queryByText("docs-pipeline")).not.toBeInTheDocument();
  });

  it("greys a row whose folder has gone since the list was drawn, instead of saying ENOENT", async () => {
    const user = userEvent.setup();
    const invoke = vi.fn();

    invoke.mockImplementation(async (channel: string) => {
      if (channel === LIST_RECENT_PROJECTS_CHANNEL) {
        return KNOWN;
      }

      throw new Error("Error invoking remote method 'projects:open': Error: PROJECT_NOT_FOUND");
    });
    standInBridge({
      invoke,
    });

    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);
    await user.click(await screen.findByText("docs-pipeline"));

    expect(await screen.findByText("НЕ ЗНАЙДЕНО")).toBeInTheDocument();
    expect(screen.queryByText(/PROJECT_NOT_FOUND/)).not.toBeInTheDocument();
  });

  it("lights whatever the cursor is over, action or project", async () => {
    const user = userEvent.setup();

    stubApi();
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);

    const action = screen.getByText(SWITCHER_OPEN_FOLDER_LABEL);

    await user.hover(action);

    expect(action).toHaveStyle({
      background: INTERACTION_HOVER_BACKGROUND_COLOR,
    });

    await user.unhover(action);

    expect(action).toHaveStyle({
      background: "transparent",
    });
  });

  it("walks the list with the arrows and opens the project it stands on with Enter", async () => {
    const user = userEvent.setup();
    const onProjectChange = vi.fn();

    stubApi({
      [OPEN_PROJECT_CHANNEL]: {
        config: {
          ...CONFIG,
          name: "docs-pipeline",
        },
        print: "print-1",
      },
    });
    render(<ProjectSwitcher project={PROJECT} onProjectChange={onProjectChange} onClose={() => {}} />);
    await openList(user);
    await screen.findByText("docs-pipeline");
    await user.keyboard("{Enter}");

    expect(onProjectChange).toHaveBeenCalled();
  });

  it("walks past the projects into the actions", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    stubApi();
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={onClose} />);
    await openList(user);
    await screen.findByText("docs-pipeline");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");

    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();

    stubApi();
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes when anything outside it is clicked", async () => {
    const user = userEvent.setup();

    stubApi();
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);
    await user.click(document.body);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("stays open while its own inside is clicked", async () => {
    const user = userEvent.setup();

    stubApi();
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);
    await user.click(screen.getByText(SWITCHER_LIST_LABEL));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("puts the project down on «Закрити проєкт», leaving the app with none open", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    stubApi();
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={onClose} />);
    await openList(user);
    await user.click(screen.getByText(SWITCHER_CLOSE_LABEL));

    // With nothing open the start screen is what stands.
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("scrolls past four projects rather than growing down the canvas", async () => {
    const user = userEvent.setup();
    const many = Array.from(
      {
        length: 9,
      },
      (_, index) => ({
        id: String(index + 2),
        name: `project-${index + 2}`,
        directory: `/work/project-${index + 2}`,
        openedAt: "2026-08-12T00:00:00.000Z",
        exists: true,
        agentCount: 1,
      }),
    );

    stubApi({
      [LIST_RECENT_PROJECTS_CHANNEL]: [KNOWN[0], ...many],
    });
    render(<ProjectSwitcher project={PROJECT} onProjectChange={() => {}} onClose={() => {}} />);
    await openList(user);

    expect(await screen.findByText("project-10")).toBeInTheDocument();

    const rows = screen.getByText("project-10").closest("[style*='overflow']");

    expect(rows).toHaveStyle({
      maxHeight: `${SWITCHER_LIST_MAX_HEIGHT_PX}px`,
      overflowY: "auto",
    });
    expect(rows?.querySelectorAll("[aria-current]")).toHaveLength(SWITCHER_LIST_SHOWN_MAX + 6);
  });
});
