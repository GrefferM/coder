import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ServerConsent } from "./server-consent";
import type { ProjectMcpServer } from "../../../../interfaces";

const LONG_LINE =
  "npx -y @modelcontextprotocol/server-postgres@0.6.2 postgresql://localhost:5432/shop --schema public --read-only --statement-timeout 30000 --log-level debug";

const SERVER: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "shop-db",
  isLocal: true,
  run: LONG_LINE,
  address: "",
  signIn: "none",
  env: ["PGUSER", "PGPASSWORD", "PGSSLMODE", "NODE_OPTIONS"],
};

function shown(server: ProjectMcpServer = SERVER) {
  const onRun = vi.fn();
  const onDecline = vi.fn();

  render(<ServerConsent server={server} directory="/Users/me/code/shop" onRun={onRun} onDecline={onDecline} />);

  return {
    onRun,
    onDecline,
  };
}

describe("ServerConsent", () => {
  it("asks by the server's name, and shows the run line whole and the folder it starts in", () => {
    shown();

    expect(screen.getByText("Запустити shop-db на цій машині?")).toBeInTheDocument();
    expect(screen.getByText(LONG_LINE)).toBeInTheDocument();
    expect(screen.getByText("/Users/me/code/shop")).toBeInTheDocument();
    expect(screen.getByText("РЯДОК ЗАПУСКУ")).toBeInTheDocument();
    expect(screen.getByText("ТЕКА")).toBeInTheDocument();
  });

  it("names every variable and says no value is shown, since none is handed to it", () => {
    shown();

    expect(screen.getByText("ЗМІННІ СЕРЕДОВИЩА · 4")).toBeInTheDocument();
    expect(screen.getByText("ЗНАЧЕНЬ НЕ ПОКАЗУЄМО")).toBeInTheDocument();

    for (const name of SERVER.env) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }

    // Nothing in the window holds a value: its whole text is the names and the words.
    expect(screen.getByRole("dialog").textContent).not.toMatch(/=/);
  });

  it("leaves the block of variables out where the server names none", () => {
    shown({
      ...SERVER,
      env: [],
    });

    expect(screen.queryByText(/ЗМІННІ СЕРЕДОВИЩА/)).not.toBeInTheDocument();
  });

  it("says where the consent lives", () => {
    shown();

    expect(
      screen.getByText("ЗГОДА ЛИШАЄТЬСЯ НА ЦІЙ МАШИНІ · ЗМІНИТЬСЯ РЯДОК У ФАЙЛІ — СПИТАЄМО ЗНОВУ"),
    ).toBeInTheDocument();
  });

  it("«Запустити» runs, and nothing else does", async () => {
    const { onRun, onDecline } = shown();

    await userEvent.click(
      screen.getByRole("button", {
        name: "Запустити",
      }),
    );

    expect(onRun).toHaveBeenCalledOnce();
    expect(onDecline).not.toHaveBeenCalled();
  });

  it("«Не запускати» and Escape both decline, and neither runs", async () => {
    const { onRun, onDecline } = shown();

    await userEvent.click(
      screen.getByRole("button", {
        name: "Не запускати",
      }),
    );
    await userEvent.keyboard("{Escape}");

    expect(onDecline).toHaveBeenCalledTimes(2);
    expect(onRun).not.toHaveBeenCalled();
  });

  it("holds the focus on the safe answer first", () => {
    shown();

    expect(
      screen.getByRole("button", {
        name: "Не запускати",
      }),
    ).toHaveFocus();
  });
});
