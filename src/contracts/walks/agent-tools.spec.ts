import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentTools } from "./agent-tools";
import { NO_MCP_CALLS } from "../mcp/no-calls.constant";
import { aCommand, anAgent } from "../testing/project-fixtures";
import type { AgentCommandTool } from "../llm/agent-command-tool.interface";
import type { AgentServerTool } from "../llm/agent-server-tool.interface";
import type { McpLook } from "../mcp/mcp-look.interface";
import type { ProjectCommand, ToolGrant } from "../project";

const COMMANDS: ProjectCommand[] = [
  aCommand({
    name: "Прогнати тести",
    description: "Проганяє тести пакета",
    run: "npm test -- {pattern} --reporter={format}",
    parameters: [
      {
        id: "parameter-1",
        name: "pattern",
        type: "text",
        description: "Що прогнати",
        isRequired: true,
        values: [],
      },
      {
        id: "parameter-2",
        name: "format",
        type: "enum",
        description: "Як звітувати",
        isRequired: false,
        values: ["dot", "verbose"],
      },
    ],
  }),
];

const GRANT: ToolGrant = {
  id: "grant-1",
  source: "command",
  commandId: "command-1",
  pinned: [
    {
      id: "pinned-1",
      parameterId: "parameter-2",
      value: "dot",
    },
  ],
};

const SERVER_ID = "99999999-9999-4999-8999-999999999999";

const SERVER_GRANT: ToolGrant = {
  id: "grant-2",
  source: "mcp",
  serverId: SERVER_ID,
  functionName: "read_file",
};

/** What one server says it hands over this time; not stored in any file. */
const LOOKS: Record<string, McpLook> = {
  [SERVER_ID]: {
    serverId: SERVER_ID,
    isUp: true,
    functions: [
      {
        name: "read_file",
        description: "Читає файл",
        parameters: {
          type: "object",
          properties: {
            path: {
              type: "string",
            },
          },
          required: ["path"],
        },
      },
    ],
    answeredAt: 1_700_000_000_000,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
  },
};

const NO_LOOKS: Record<string, McpLook> = {};

describe("agentTools", () => {
  it("hands the model the open parameters alone, and keeps the fixed one to put in itself", () => {
    const [tool] = <AgentCommandTool[]>agentTools([GRANT], {
      commands: COMMANDS,
      servers: [],
      looks: NO_LOOKS,
      agents: [],
    });

    assert.equal(tool.source, "command");
    assert.deepEqual(
      tool.parameters.map((parameter) => parameter.name),
      ["pattern"],
    );
    assert.deepEqual(tool.pinned, {
      format: "dot",
    });
  });

  it("carries the line and the description the command was declared with", () => {
    const [tool] = <AgentCommandTool[]>agentTools([GRANT], {
      commands: COMMANDS,
      servers: [],
      looks: NO_LOOKS,
      agents: [],
    });

    assert.equal(tool.run, "npm test -- {pattern} --reporter={format}");
    assert.equal(tool.description, "Проганяє тести пакета");
  });

  it("leaves out a grant whose command is gone, rather than handing over a line nobody wrote", () => {
    assert.deepEqual(
      agentTools(
        [
          {
            ...GRANT,
            commandId: "a command deleted long ago",
          },
        ],
        {
          commands: COMMANDS,
          servers: [],
          looks: NO_LOOKS,
          agents: [],
        },
      ),
      [],
    );
  });

  it("hands the model a server's function as the server described it, and rewrites none of the schema", () => {
    const [tool] = <AgentServerTool[]>agentTools([SERVER_GRANT], {
      commands: COMMANDS,
      servers: [],
      looks: LOOKS,
      agents: [],
    });

    assert.equal(tool.source, "mcp");
    assert.equal(tool.name, "read_file");
    assert.equal(tool.description, "Читає файл");
    assert.equal(tool.serverId, SERVER_ID);
    assert.deepEqual(tool.parameters, LOOKS[SERVER_ID].functions[0].parameters);
  });

  it("leaves out a granted function whose server did not answer, since there is nothing to hand over", () => {
    assert.deepEqual(
      agentTools([SERVER_GRANT], {
        commands: COMMANDS,
        servers: [],
        looks: NO_LOOKS,
        agents: [],
      }),
      [],
    );
  });

  it("leaves out a granted function that left the server's list after an update, and keeps the rest", () => {
    // The grant stands but the catalogue lost it; the turn has nothing.
    const tools = agentTools(
      [
        GRANT,
        {
          ...SERVER_GRANT,
          functionName: "pulls.merge",
        },
      ],
      {
        commands: COMMANDS,
        servers: [],
        looks: LOOKS,
        agents: [],
      },
    );

    assert.deepEqual(
      tools.map((tool) => tool.name),
      ["Прогнати тести"],
    );
  });

  it("keeps both kinds side by side, in the order they were granted", () => {
    const tools = agentTools([SERVER_GRANT, GRANT], {
      commands: COMMANDS,
      servers: [],
      looks: LOOKS,
      agents: [],
    });

    assert.deepEqual(
      tools.map((tool) => [tool.source, tool.name]),
      [
        ["mcp", "read_file"],
        ["command", "Прогнати тести"],
      ],
    );
  });

  it("one name is one tool: the person's own command keeps it, and the server's function of that name stands out", () => {
    const named = agentTools(
      [
        GRANT,
        {
          ...SERVER_GRANT,
          functionName: "Прогнати тести",
        },
      ],
      {
        commands: COMMANDS,
        servers: [],
        looks: {
          [SERVER_ID]: {
            ...LOOKS[SERVER_ID],
            functions: [
              {
                name: "Прогнати тести",
                description: "Не та, що оголосили",
                parameters: {},
              },
            ],
          },
        },
        agents: [],
      },
    );

    assert.deepEqual(
      named.map((tool) => tool.source),
      ["command"],
    );
  });

  it("hands another agent over by its own name, with its short description as what the model reads", () => {
    const tools = agentTools(
      [
        {
          id: "grant-agent",
          source: "agent",
          agentId: "agent-2",
        },
      ],
      {
        commands: [],
        servers: [],
        looks: NO_LOOKS,
        agents: [
          anAgent({
            id: "agent-2",
            name: "reviewer",
            purpose: "Переглядає зміни",
          }),
        ],
      },
    );

    assert.deepEqual(tools, [
      {
        source: "agent",
        name: "reviewer",
        description: "Переглядає зміни",
        agentId: "agent-2",
      },
    ]);
  });

  it("leaves out an agent the project has let go", () => {
    const tools = agentTools(
      [
        {
          id: "grant-agent",
          source: "agent",
          agentId: "agent-gone",
        },
      ],
      {
        commands: [],
        servers: [],
        looks: NO_LOOKS,
        agents: [],
      },
    );

    assert.deepEqual(tools, []);
  });
});
