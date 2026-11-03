import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ServersPanel } from "./servers-panel";
import type { DeclaringActs, ServerActs, ServerCatalogue, ServerDeclaring, ServersPanelProps } from "./interfaces";
import { SERVERS_PANEL_EMPTY_LABEL } from "./constants";
import {
  NOTHING_HELD,
  SERVER_CALL_LOST_LABEL,
  SERVER_FUNCTIONS_SEARCH_PLACEHOLDER,
  SERVER_RESTART_ALIVE_LABEL,
  SERVER_RESTART_LABEL,
  SERVER_ASK_AGAIN_LABEL,
  SERVER_SHOW_CALL_LABEL,
  SERVER_STARTING_SLOW_AFTER_SECONDS,
  SERVER_STARTING_SLOW_LABEL,
  SERVER_STOP_ASKING_LABEL,
  SERVER_STOP_LABEL,
  SERVER_UNKNOWN_LABEL,
} from "../../constants";
import { MS_IN_SECOND } from "../../../../utils/dates/constants";
import { startingCeiling } from "../../words";
import { anAgent } from "../../../../testing";
import type { Agent, McpLook, ProjectMcpServer } from "../../../../interfaces";
import { NO_MCP_CALLS } from "../../../../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function aServer(patch: Partial<ProjectMcpServer> = {}): ProjectMcpServer {
  return {
    id: SERVER_ID,
    name: "filesystem-mcp",
    isLocal: true,
    run: "npx server-filesystem .",
    address: "",
    signIn: "none",
    env: [],
    ...patch,
  };
}

function aLook(patch: Partial<McpLook> = {}): McpLook {
  return {
    serverId: SERVER_ID,
    isUp: true,
    functions: [
      {
        name: "read_file",
        description: "Читає файл",
        parameters: {},
      },
    ],
    answeredAt: 1_700_000_000_000,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
    ...patch,
  };
}

/** An agent holding one function of the first server. */
function holding(): Agent[] {
  return [
    anAgent({
      tools: [
        {
          id: "grant-1",
          source: "mcp",
          serverId: SERVER_ID,
          functionName: "read_file",
        },
      ],
    }),
  ];
}

/** Everything the catalogue takes, flat; `panelProps` puts each back into its owning part. */
interface PanelSays extends ServerCatalogue, ServerDeclaring, ServerActs, DeclaringActs {}

function panelProps(says: Partial<PanelSays> = {}): ServersPanelProps {
  const said: PanelSays = {
    servers: [aServer()],
    looks: {
      [SERVER_ID]: aLook(),
    },
    askingSince: {},
    agents: holding(),
    onRestart: () => {},
    onStop: () => {},
    onCancel: () => {},
    onAskAgain: () => {},
    onSeen: () => {},
    onShowCall: async () => true,
    openServerId: null,
    form: null,
    held: NOTHING_HELD,
    secrets: {},
    onSecretChange: () => {},
    onArm: () => {},
    onOpenForm: () => {},
    onFormChange: () => {},
    onSaveForm: () => Promise.resolve(),
    onCancelForm: () => {},
    ...says,
  };

  return {
    catalogue: {
      servers: said.servers,
      looks: said.looks,
      askingSince: said.askingSince,
      agents: said.agents,
    },
    declaring: {
      openServerId: said.openServerId,
      form: said.form,
      held: said.held,
      secrets: said.secrets,
    },
    serverActs: {
      onRestart: said.onRestart,
      onStop: said.onStop,
      onCancel: said.onCancel,
      onAskAgain: said.onAskAgain,
      onSeen: said.onSeen,
      onShowCall: said.onShowCall,
      onArm: said.onArm,
    },
    declaringActs: {
      onOpenForm: said.onOpenForm,
      onFormChange: said.onFormChange,
      onSecretChange: said.onSecretChange,
      onSaveForm: said.onSaveForm,
      onCancelForm: said.onCancelForm,
    },
  };
}

function panel(says: Partial<PanelSays> = {}) {
  return render(<ServersPanel {...panelProps(says)} />);
}

describe("ServersPanel", () => {
  it("tells a server nobody has a token for from one that fell, in words and in what it offers", async () => {
    // Never started: no «ПРОЦЕС УПАВ» and no count; the action is typing the token in.
    const onOpenForm = vi.fn();

    panel({
      onOpenForm,
      looks: {
        [SERVER_ID]: aLook({
          isUp: false,
          functions: [],
          answeredAt: null,
          failure: "Error: MCP_TOKEN_MISSING",
        }),
      },
    });

    expect(screen.getByText("ПОТРІБЕН ТОКЕН · 1 АГЕНТ")).toBeInTheDocument();

    await userEvent.click(screen.getByText("УВІЙТИ"));

    expect(onOpenForm).toHaveBeenCalledWith(SERVER_ID);
  });

  it("names the variable that has no value on this machine, and offers to write it in", () => {
    // «НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY»: the refusal carries the name.
    panel({
      looks: {
        [SERVER_ID]: aLook({
          isUp: false,
          functions: [],
          answeredAt: null,
          failure: "Error: MCP_ENV_VALUE_MISSING: BRAVE_API_KEY",
        }),
      },
    });

    expect(screen.getByText(/НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY/)).toBeInTheDocument();
    expect(screen.getByText("ВПИСАТИ")).toBeInTheDocument();
  });

  it("opens every row, the fallen one included, because that is where its line is mended", async () => {
    // A fallen row still opens.
    panel({
      looks: {
        [SERVER_ID]: {
          ...aLook(),
          isUp: false,
          functions: [],
          failure: "Error: spawn npx ENOENT",
        },
      },
    });

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.getByText("npx server-filesystem .")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "ЗМІНИТИ",
      }),
    ).toBeInTheDocument();
  });

  it("opens the form on the server whose row was pressed, so a wrong line can be mended", async () => {
    // The edit action stands in the card, reachable in every state.
    const onOpenForm = vi.fn();

    panel({
      onOpenForm,
    });

    // «змінити» is in the foot of the opened card, so the row opens first.
    await userEvent.click(screen.getByText("filesystem-mcp"));
    await userEvent.click(
      screen.getByRole("button", {
        name: "ЗМІНИТИ",
      }),
    );

    expect(onOpenForm).toHaveBeenCalledWith(SERVER_ID);
  });

  it("stands a row for every server the project names, with what it is and what it hands over", () => {
    panel();

    expect(screen.getByText("filesystem-mcp")).toBeInTheDocument();
    expect(screen.getByText("ЛОКАЛЬНИЙ · 1 ФУНКЦІЯ · 1 АГЕНТ")).toBeInTheDocument();
  });

  it("counts the agents by the server's id, and not by any function's name", () => {
    panel({
      servers: [
        aServer(),
        aServer({
          id: OTHER_ID,
          name: "github-mcp",
          isLocal: false,
        }),
      ],
      looks: {
        [SERVER_ID]: aLook(),
        [OTHER_ID]: aLook({
          serverId: OTHER_ID,
        }),
      },
    });

    // The agent holds a function of the first server only.
    expect(screen.getByText("ЛОКАЛЬНИЙ · 1 ФУНКЦІЯ · 1 АГЕНТ")).toBeInTheDocument();
    expect(screen.getByText("ВІДДАЛЕНИЙ · 1 ФУНКЦІЯ")).toBeInTheDocument();
  });

  it("a call that failed stands under the name, while the dot stays as it was", () => {
    // «червоніє смуга, а не стан сервера»: the connection is whole.
    panel({
      looks: {
        [SERVER_ID]: aLook({
          calls: {
            failedInARow: 1,
            hasWorked: true,
            lastFailure: {
              callId: "call-1",
              functionName: "browser_navigate",
              said: "Chromium distribution 'chrome' is not found\nat /Applications/Google Chrome.app",
              at: new Date(2024, 0, 1, 14, 12).getTime(),
            },
          },
        }),
      },
    });

    expect(screen.getByText("ОСТАННІЙ ВИКЛИК УПАВ · 14:12")).toBeInTheDocument();
    // The row shows the start of the server's sentence; the rest is in the call's card.
    expect(screen.getByText("browser_navigate · Chromium distribution 'chrome' is not found")).toBeInTheDocument();
    expect(screen.getByText("ЛОКАЛЬНИЙ · 1 ФУНКЦІЯ · 1 АГЕНТ")).toBeInTheDocument();
  });

  it("hands the chat the call the row is talking about, by that call's own id", async () => {
    // «ПОКАЗАТИ ВИКЛИК» — передача, а не друга домівка.
    const onShowCall = vi.fn().mockResolvedValue(true);

    panel({
      looks: {
        [SERVER_ID]: aLook({
          calls: {
            failedInARow: 1,
            hasWorked: true,
            lastFailure: {
              callId: "call-7",
              functionName: "browser_navigate",
              said: "Chromium distribution 'chrome' is not found",
              at: new Date(2024, 0, 1, 14, 12).getTime(),
            },
          },
        }),
      },
      onShowCall,
    });

    await userEvent.click(screen.getByText(SERVER_SHOW_CALL_LABEL));

    expect(onShowCall).toHaveBeenCalledWith("call-7");
  });

  it("says the record does not lead to the call, in place of offering the way, when the way led nowhere", async () => {
    // A forgotten run took its calls with it; the press answers with a word.
    const onShowCall = vi.fn().mockResolvedValue(false);

    panel({
      looks: {
        [SERVER_ID]: aLook({
          calls: {
            failedInARow: 1,
            hasWorked: true,
            lastFailure: {
              callId: "call-7",
              functionName: "browser_navigate",
              said: "Chromium distribution 'chrome' is not found",
              at: new Date(2024, 0, 1, 14, 12).getTime(),
            },
          },
        }),
      },
      onShowCall,
    });

    await userEvent.click(screen.getByText(SERVER_SHOW_CALL_LABEL));

    expect(await screen.findByText(SERVER_CALL_LOST_LABEL)).toBeInTheDocument();
    // The offer that cannot be kept is withdrawn.
    expect(screen.queryByText(SERVER_SHOW_CALL_LABEL)).not.toBeInTheDocument();
  });

  it("goes on offering the way where it led somewhere, since the call is still in the record", async () => {
    const onShowCall = vi.fn().mockResolvedValue(true);

    panel({
      looks: {
        [SERVER_ID]: aLook({
          calls: {
            failedInARow: 1,
            hasWorked: true,
            lastFailure: {
              callId: "call-7",
              functionName: "browser_navigate",
              said: "Chromium distribution 'chrome' is not found",
              at: new Date(2024, 0, 1, 14, 12).getTime(),
            },
          },
        }),
      },
      onShowCall,
    });

    await userEvent.click(screen.getByText(SERVER_SHOW_CALL_LABEL));

    expect(screen.getByText(SERVER_SHOW_CALL_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(SERVER_CALL_LOST_LABEL)).not.toBeInTheDocument();
  });

  it("a server nobody has called stands with no stripe at all", () => {
    panel({});

    expect(screen.queryByText(/ОСТАННІЙ ВИКЛИК УПАВ/)).not.toBeInTheDocument();
  });

  it("a server that works for nobody says so in place of its kind, in words and with the way out", () => {
    const onRestart = vi.fn();

    panel({
      looks: {
        [SERVER_ID]: aLook({
          calls: {
            failedInARow: 3,
            hasWorked: false,
            lastFailure: {
              callId: "call-1",
              functionName: "browser_navigate",
              said: "Chromium distribution 'chrome' is not found",
              at: new Date(2024, 0, 1, 14, 12).getTime(),
            },
          },
        }),
      },
      onRestart,
    });

    expect(screen.getByText("ЖИВИЙ · ЖОДНА ФУНКЦІЯ НЕ ВІДПОВІЛА · 1 ФУНКЦІЯ · 1 АГЕНТ")).toBeInTheDocument();
    expect(screen.getByText(/^3 виклики поспіль упали/)).toBeInTheDocument();
    // A troubled row offers a new connection.
    expect(screen.getByText(SERVER_RESTART_ALIVE_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(SERVER_RESTART_LABEL)).not.toBeInTheDocument();
  });

  it("keeps the last call under that state too, and drops the word «УПАВ» the state has already said", () => {
    panel({
      looks: {
        [SERVER_ID]: aLook({
          calls: {
            failedInARow: 3,
            hasWorked: false,
            lastFailure: {
              callId: "call-1",
              functionName: "browser_navigate",
              said: "Chromium distribution 'chrome' is not found",
              at: new Date(2024, 0, 1, 14, 12).getTime(),
            },
          },
        }),
      },
    });

    expect(screen.getByText("ОСТАННІЙ ВИКЛИК · 14:12")).toBeInTheDocument();
    expect(screen.queryByText(/ОСТАННІЙ ВИКЛИК УПАВ/)).not.toBeInTheDocument();
    // «Тіло стану — той самий рядок сервера, що в смузі»: one text in both places.
    expect(screen.getByText("browser_navigate · Chromium distribution 'chrome' is not found")).toBeInTheDocument();
  });

  it("opens the card of one server and stands what it hands over, with the agents holding each", async () => {
    // The catalogue hands nothing out: «2 АГ.» is a count, never a tick.
    panel({
      looks: {
        [SERVER_ID]: aLook({
          functions: [
            {
              name: "read_file",
              description: "Читає файл",
              parameters: {},
            },
            {
              name: "list_dir",
              description: "Перелічує теку",
              parameters: {},
            },
          ],
        }),
      },
    });

    expect(screen.queryByText("Читає файл")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("filesystem-mcp"));

    // By name, so the list does not move about between looks.
    expect(screen.getByText("list_dir")).toBeInTheDocument();
    expect(screen.getByText("Читає файл")).toBeInTheDocument();
    expect(screen.getByText("1 АГ.")).toBeInTheDocument();
    // A function nobody holds says nothing rather than a zero.
    expect(screen.queryByText("0 АГ.")).not.toBeInTheDocument();
  });

  it("searches one server's functions and counts what it found against what there is", async () => {
    panel({
      looks: {
        [SERVER_ID]: aLook({
          functions: [
            {
              name: "read_file",
              description: "Читає файл",
              parameters: {},
            },
            {
              name: "list_dir",
              description: "Перелічує теку",
              parameters: {},
            },
          ],
        }),
      },
    });

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(SERVER_FUNCTIONS_SEARCH_PLACEHOLDER), "теку");

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("list_dir")).toBeInTheDocument();
    expect(screen.queryByText("read_file")).not.toBeInTheDocument();
  });

  it("says nothing of a grant the server no longer names: that trouble is the agent's, and told there", async () => {
    // This page mends no grant; the trouble is told among the agent's broken grants.
    panel({
      looks: {
        [SERVER_ID]: aLook({
          functions: [
            {
              name: "list_dir",
              description: "Перелічує теку",
              parameters: {},
            },
          ],
        }),
      },
    });

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.queryByText("read_file")).not.toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });

  it("opens a server that has not answered with no search, since it hands nothing over to search", async () => {
    // The page still opens; the line that would not start is mended there.
    panel({
      looks: {
        [SERVER_ID]: aLook({
          isUp: false,
          functions: [],
          answeredAt: null,
          failure: "spawn ENOENT",
        }),
      },
    });

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.queryByLabelText(SERVER_FUNCTIONS_SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
    expect(screen.getByText("spawn ENOENT")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "ЗМІНИТИ",
      }),
    ).toBeInTheDocument();
  });

  it("takes a server's page away with the server, and does not bring it back with an undo", async () => {
    // ⌘Z restores the server within thirty seconds onto the catalogue, not its own page.
    const { rerender } = panel();

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.getByLabelText("Назад до MCP")).toBeInTheDocument();

    rerender(
      <ServersPanel
        {...panelProps({
          servers: [],
        })}
      />,
    );

    expect(screen.queryByLabelText("Назад до MCP")).not.toBeInTheDocument();

    rerender(<ServersPanel {...panelProps()} />);

    expect(screen.queryByLabelText("Назад до MCP")).not.toBeInTheDocument();
    expect(screen.getByText("filesystem-mcp")).toBeInTheDocument();
  });

  it("comes back from a server's page to the catalogue, leaving every other row where it was", async () => {
    panel();

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.getByLabelText("Назад до MCP")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("Назад до MCP"));

    expect(screen.getByText("ЛОКАЛЬНИЙ · 1 ФУНКЦІЯ · 1 АГЕНТ")).toBeInTheDocument();
  });

  it("a server's page says how fresh its answer is, on the app's one scale", async () => {
    // The closing line, read by the scale, not the hour.
    panel({
      looks: {
        [SERVER_ID]: aLook({
          answeredAt: Date.now(),
        }),
      },
    });

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.getByText("Відповів щойно")).toBeInTheDocument();
  });

  it("says nothing at all where there was no answer, rather than standing with a dash", async () => {
    // No dash for an unanswered server; the line goes whole.
    panel({
      looks: {
        [SERVER_ID]: aLook({
          answeredAt: null,
        }),
      },
    });

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.queryByText(/Відповів/)).not.toBeInTheDocument();
  });

  it("a fallen server says so and carries the one action there is", async () => {
    const onRestart = vi.fn();

    panel({
      looks: {
        [SERVER_ID]: aLook({
          isUp: false,
          functions: [],
          answeredAt: null,
          failure: "spawn ENOENT · npx: command not found",
        }),
      },
      onRestart,
    });

    expect(screen.getByText("ПРОЦЕС УПАВ · 1 АГЕНТ")).toBeInTheDocument();
    // The failure words stand under a fallen row.
    expect(screen.getByText("spawn ENOENT · npx: command not found")).toBeInTheDocument();

    await userEvent.click(screen.getByText(SERVER_RESTART_LABEL));

    expect(onRestart).toHaveBeenCalledWith(SERVER_ID);
  });

  it("a server that answered is never offered a start, since it is already up", () => {
    // A standing server's head action is to be let go, not raised.
    panel();

    expect(screen.queryByText(SERVER_RESTART_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByText(SERVER_RESTART_ALIVE_LABEL)).not.toBeInTheDocument();
  });

  it("a server being asked counts a clock up and names the ceiling, and is not called fallen meanwhile", () => {
    // A clock and no bar, with the handshake ceiling stated while waiting.
    panel({
      looks: {},
      askingSince: {
        [SERVER_ID]: Date.now(),
      },
    });

    expect(screen.getByText("ЗАПУСКАЄТЬСЯ · 00:00 · 1 АГЕНТ")).toBeInTheDocument();
    expect(screen.getByText(startingCeiling())).toBeInTheDocument();
    expect(screen.queryByText(SERVER_RESTART_LABEL)).not.toBeInTheDocument();
  });

  it("holds the second line back until the twentieth second, and says it after", () => {
    // «доти чекання звичайне»: no long-start line on a wait of three seconds.
    const { rerender } = panel({
      looks: {},
      askingSince: {
        [SERVER_ID]: Date.now(),
      },
    });

    expect(screen.queryByText(SERVER_STARTING_SLOW_LABEL)).not.toBeInTheDocument();

    rerender(
      <ServersPanel
        {...panelProps({
          looks: {},
          askingSince: {
            [SERVER_ID]: Date.now() - SERVER_STARTING_SLOW_AFTER_SECONDS * MS_IN_SECOND,
          },
        })}
      />,
    );

    expect(screen.getByText(SERVER_STARTING_SLOW_LABEL)).toBeInTheDocument();
  });

  it("«СКАСУВАТИ» gives the place back, and does not also walk into the server's page", async () => {
    // The waiting action is the cancel press.
    const onCancel = vi.fn();
    const onShowCall = vi.fn().mockResolvedValue(true);

    panel({
      looks: {},
      askingSince: {
        [SERVER_ID]: Date.now(),
      },
      onCancel,
      onShowCall,
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: SERVER_STOP_ASKING_LABEL,
      }),
    );

    expect(onCancel).toHaveBeenCalledWith(SERVER_ID);
    // A press on this button is not a press on the row.
    expect(screen.getByText(SERVER_STOP_ASKING_LABEL)).toBeInTheDocument();
  });

  it("a server let go of says its list is unknown and offers the hand a way back up", async () => {
    // «СКАСУВАТИ» must not take the way up away for good.
    const onRestart = vi.fn();

    panel({
      looks: {},
      onRestart,
    });

    expect(screen.getByText(`${SERVER_UNKNOWN_LABEL} · 1 АГЕНТ`)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: SERVER_RESTART_LABEL,
      }),
    );

    expect(onRestart).toHaveBeenCalledWith(SERVER_ID);
  });

  it("asks a standing remote server for its list again from its page, and kills nothing", async () => {
    // The kind decides the word: a connection is asked again, a local process is raised afresh.
    const onAskAgain = vi.fn();
    const onRestart = vi.fn();

    panel({
      servers: [
        aServer({
          isLocal: false,
          run: "",
          address: "https://mcp.linear.app/sse",
        }),
      ],
      onAskAgain,
      onRestart,
    });

    await userEvent.click(screen.getByText("filesystem-mcp"));
    await userEvent.click(
      screen.getByRole("button", {
        name: SERVER_ASK_AGAIN_LABEL,
      }),
    );

    expect(onAskAgain).toHaveBeenCalledWith(SERVER_ID);
    expect(onRestart).not.toHaveBeenCalled();
  });

  it("raises a standing local server afresh from its page, since that one is our own process", async () => {
    const onRestart = vi.fn();

    panel({
      onRestart,
    });

    await userEvent.click(screen.getByText("filesystem-mcp"));
    await userEvent.click(
      screen.getByRole("button", {
        name: SERVER_RESTART_ALIVE_LABEL,
      }),
    );

    expect(onRestart).toHaveBeenCalledWith(SERVER_ID);
  });

  it("offers to stop a standing local server in its row, where «ЗАПУСТИТИ» would stand, and stops it by its id", async () => {
    const onStop = vi.fn();
    const onRestart = vi.fn();

    panel({
      onStop,
      onRestart,
    });

    expect(screen.queryByText(SERVER_RESTART_LABEL)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: SERVER_STOP_LABEL,
      }),
    );

    expect(onStop).toHaveBeenCalledWith(SERVER_ID);
    expect(onRestart).not.toHaveBeenCalled();
  });

  it("offers «ЗАПУСТИТИ» and no stop to a local server nobody raised", () => {
    panel({
      looks: {},
    });

    expect(screen.getByText(SERVER_RESTART_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(SERVER_STOP_LABEL)).not.toBeInTheDocument();
  });

  it("never offers to stop a remote server: nothing of it runs on this machine", () => {
    panel({
      servers: [
        aServer({
          isLocal: false,
          run: "",
          address: "https://mcp.linear.app/mcp",
        }),
      ],
    });

    expect(screen.queryByText(SERVER_STOP_LABEL)).not.toBeInTheDocument();
  });

  it("keeps the server's page as it was: a standing local server is raised afresh there, never stopped", async () => {
    panel();

    await userEvent.click(screen.getByText("filesystem-mcp"));

    expect(screen.queryByText(SERVER_STOP_LABEL)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: SERVER_RESTART_ALIVE_LABEL,
      }),
    ).toBeInTheDocument();
  });

  it("says where servers come from while there are none, rather than offering what is not built", () => {
    panel({
      servers: [],
      looks: {},
      agents: [],
    });

    expect(screen.getByText(SERVERS_PANEL_EMPTY_LABEL)).toBeInTheDocument();
  });
});
