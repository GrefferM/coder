import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServersSection } from "./servers-section";
import { LOST_GRANTS_NOTES } from "../lost-grants/constants";
import { PICKER_SEARCH_PLACEHOLDER } from "../../../../../../../../components/picker-shell/constants";
import { NO_MCP_CALLS } from "../../../../../../../../interfaces";
import type { McpLook, ProjectMcpServer, ToolGrant } from "../../../../../../../../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function aServer(patch: Partial<ProjectMcpServer> = {}): ProjectMcpServer {
  return {
    id: SERVER_ID,
    name: "github-mcp",
    isLocal: false,
    run: "",
    address: "https://mcp.example.com/sse",
    signIn: "browser",
    env: [],
    ...patch,
  };
}

function aLook(serverId: string, names: string[]): McpLook {
  return {
    serverId,
    isUp: true,
    functions: names.map((name) => ({
      name,
      description: `Що робить ${name}`,
      parameters: {},
    })),
    answeredAt: 1_700_000_000_000,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
  };
}

const SERVERS = [
  aServer(),
  aServer({
    id: OTHER_ID,
    name: "playwright-mcp",
  }),
];

const LOOKS: Record<string, McpLook> = {
  [SERVER_ID]: aLook(SERVER_ID, ["pulls.create", "pulls.list"]),
  [OTHER_ID]: aLook(OTHER_ID, ["browser_click"]),
};

/** A command's grant, which this section neither counts nor touches — it belongs to the section above. */
const COMMAND_GRANT: ToolGrant = {
  id: "grant-command",
  source: "command",
  commandId: "command-1",
  pinned: [],
};

function held(functionName: string, serverId = SERVER_ID): ToolGrant {
  return {
    id: `grant-${functionName}`,
    source: "mcp",
    serverId,
    functionName,
  };
}

function renderSection(grants: ToolGrant[], servers = SERVERS, looks = LOOKS) {
  const onGrantsChange = vi.fn();
  const onOpenServer = vi.fn();

  render(
    <ServersSection
      servers={servers}
      looks={looks}
      grants={grants}
      wasValue={null}
      onGrantsChange={onGrantsChange}
      onOpenServer={onOpenServer}
    />,
  );

  return {
    onGrantsChange,
    onOpenServer,
  };
}

function openList() {
  fireEvent.click(
    screen.getByRole("button", {
      expanded: false,
    }),
  );
}

describe("ServersSection", () => {
  it("offers servers and never their functions: a server arrives whole and is connected whole", () => {
    renderSection([]);
    openList();

    expect(screen.getByLabelText("Видати github-mcp")).toBeInTheDocument();
    expect(screen.getByLabelText("Видати playwright-mcp")).toBeInTheDocument();
    expect(screen.queryByLabelText(/pulls.create/)).not.toBeInTheDocument();
  });

  it("says how many servers it is connected to, and how many the project names", () => {
    renderSection([held("pulls.create")]);

    expect(screen.getByText("MCP · 1")).toBeInTheDocument();
    expect(screen.getByText("1 з 2 серверів")).toBeInTheDocument();
  });

  it("says so plainly while nothing is connected", () => {
    renderSection([COMMAND_GRANT]);

    expect(screen.getByText("Підключити сервер")).toBeInTheDocument();
    expect(screen.getByText("MCP · 0")).toBeInTheDocument();
  });

  it("connecting takes everything the server hands over right now, and nothing of the others", () => {
    const { onGrantsChange } = renderSection([COMMAND_GRANT]);

    openList();
    fireEvent.click(screen.getByLabelText("Видати github-mcp"));

    expect(onGrantsChange).toHaveBeenCalledWith([
      COMMAND_GRANT,
      expect.objectContaining({
        source: "mcp",
        serverId: SERVER_ID,
        functionName: "pulls.create",
      }),
      expect.objectContaining({
        functionName: "pulls.list",
      }),
    ]);
  });

  it("disconnecting takes back everything of that server and leaves the rest standing", () => {
    const { onGrantsChange } = renderSection([COMMAND_GRANT, held("pulls.create"), held("browser_click", OTHER_ID)]);

    openList();
    fireEvent.click(screen.getByLabelText("Видати github-mcp"));

    expect(onGrantsChange).toHaveBeenCalledWith([COMMAND_GRANT, held("browser_click", OTHER_ID)]);
  });

  it("stands each connected server under the field with how much of it is held", () => {
    renderSection([held("pulls.create")]);

    expect(screen.getByText("1 з 2")).toBeInTheDocument();
    expect(screen.queryByText("pulls.create")).not.toBeInTheDocument();
  });

  it("asks for a server's own step when its row is pressed, and opens nothing itself", () => {
    // The functions of a server are a step of the tab, the way an opened grant is, not a swap inside a field.
    const { onOpenServer } = renderSection([held("pulls.create")]);

    fireEvent.click(screen.getByLabelText(/Переглянути функції github-mcp/));

    expect(onOpenServer).toHaveBeenCalledWith(SERVER_ID);
    expect(screen.queryByLabelText(/Видати pulls.create/)).not.toBeInTheDocument();
  });

  it("shows a grant whose function the standing server no longer gives, and counts it nowhere", () => {
    renderSection([held("pulls.merge")]);

    expect(screen.getByText(LOST_GRANTS_NOTES.goneFunction)).toBeInTheDocument();
  });

  it("leaves a lost command to the section that holds commands", () => {
    renderSection([
      {
        id: "grant-lost",
        source: "command",
        commandId: "command-gone",
        pinned: [],
      },
    ]);

    expect(screen.queryByText(LOST_GRANTS_NOTES.command)).not.toBeInTheDocument();
  });

  it("searches the servers by name", () => {
    renderSection([]);
    openList();
    fireEvent.change(screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER), {
      target: {
        value: "play",
      },
    });

    expect(screen.getByLabelText("Видати playwright-mcp")).toBeInTheDocument();
    expect(screen.queryByLabelText("Видати github-mcp")).not.toBeInTheDocument();
  });
});
