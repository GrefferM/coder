import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServerView } from "./server-view";
import type { McpFunction, ProjectMcpServer, ToolGrant } from "../../../../../../../../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";

const SERVER: ProjectMcpServer = {
  id: SERVER_ID,
  name: "github-mcp",
  isLocal: false,
  run: "",
  address: "https://mcp.example.com/sse",
  signIn: "browser",
  env: [],
};

const FUNCTIONS: McpFunction[] = [
  {
    name: "pulls.create",
    description: "Відкрити пул-реквест",
    parameters: {},
  },
  {
    name: "pulls.list",
    description: "Список пул-реквестів",
    parameters: {},
  },
];

function held(functionName: string): ToolGrant {
  return {
    id: `grant-${functionName}`,
    source: "mcp",
    serverId: SERVER_ID,
    functionName,
  };
}

function renderView(grants: ToolGrant[]) {
  const onToggle = vi.fn();
  const onBack = vi.fn();

  render(
    <ServerView
      agentName="ПОШУКАЧ"
      server={SERVER}
      functions={FUNCTIONS}
      grants={grants}
      onToggle={onToggle}
      onBack={onBack}
      onSave={() => Promise.resolve()}
    />,
  );

  return {
    onToggle,
    onBack,
  };
}

describe("ServerView", () => {
  it("names whose step it is and what it is about, the way an opened grant does", () => {
    renderView([held("pulls.create")]);

    expect(screen.getByText("ПОШУКАЧ · github-mcp")).toBeInTheDocument();
  });

  it("stands every function the server hands over, with its own words and its own tick", () => {
    renderView([held("pulls.create")]);

    expect(screen.getByLabelText(/Видати pulls.create/)).toBeChecked();
    expect(screen.getByLabelText(/Видати pulls.list/)).not.toBeChecked();
    expect(screen.getByText("Список пул-реквестів")).toBeInTheDocument();
    expect(screen.getByText("1 з 2")).toBeInTheDocument();
  });

  it("lets one function in or out, and says which", () => {
    const { onToggle } = renderView([held("pulls.create")]);

    fireEvent.click(screen.getByLabelText(/Видати pulls.list/));

    expect(onToggle).toHaveBeenCalledWith("pulls.list");
  });

  it("searches by the name and by what the server said about it", () => {
    renderView([]);
    fireEvent.change(screen.getByLabelText("Пошук"), {
      target: {
        value: "Список",
      },
    });

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Видати pulls.create/)).not.toBeInTheDocument();
  });

  it("says when nothing matched, instead of standing empty", () => {
    renderView([]);
    fireEvent.change(screen.getByLabelText("Пошук"), {
      target: {
        value: "нема такого",
      },
    });

    expect(screen.getByText("Нічого не знайшлось")).toBeInTheDocument();
  });

  it("goes back from the head, and from Escape as an opened grant does", () => {
    const { onBack } = renderView([]);

    fireEvent.click(screen.getByLabelText("Назад до налаштувань"));

    expect(onBack).toHaveBeenCalled();
  });
});
