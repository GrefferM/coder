import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { PROJECT_CONFIG_VERSION } from "../constants";
import { LINKS_MAKE_RING, LINKS_REPEAT, PROJECT_FROM_NEWER_BUILD } from "../../../contracts";
import { ProjectConfigSerializer } from "./project-config-serializer.service";
import type { CommandToolGrantDto, McpToolGrantDto, SystemToolGrantDto } from "../dto";

const MODEL_ID = "11111111-1111-4111-8111-111111111111";
const AGENT_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_AGENT_ID = "33333333-3333-4333-8333-333333333333";
// A link's far end is not checked against the declared agents.
const THIRD_AGENT_ID = "77777777-7777-4777-8777-777777777777";
const LINK_ID = "44444444-4444-4444-8444-444444444444";
const PROMPT_ID = "55555555-5555-4555-8555-555555555555";
const COMMAND_ID = "66666666-6666-4666-8666-666666666666";
const PARAMETER_ID = "77777777-7777-4777-8777-777777777777";
const GRANT_ID = "88888888-8888-4888-8888-888888888888";
const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_SERVER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

/** A local server is a run line; a remote one an address and a sign-in. */
function serversYaml(...servers: string[]): string {
  return `servers:\n${servers.join("\n")}\n`;
}

const LOCAL_SERVER_YAML = `  - id: ${SERVER_ID}
    name: filesystem
    isLocal: true
    run: npx @modelcontextprotocol/server-filesystem .`;

const SERVER_WITH_ENV_YAML = `  - id: ${SERVER_ID}
    name: brave
    isLocal: true
    run: npx @modelcontextprotocol/server-brave-search
    env:
      - BRAVE_API_KEY
      - BRAVE_REGION`;

const REMOTE_SERVER_YAML = `  - id: ${OTHER_SERVER_ID}
    name: linear
    isLocal: false
    address: https://mcp.linear.app/sse
    signIn: token`;

function agentYaml(id: string, name: string): string {
  return `  - id: ${id}
    name: ${name}
    modelId: ${MODEL_ID}
    color: "#b18aff"
    isActive: true
    x: 10
    y: 20
    maxCalls: 8`;
}

const VALID_YAML = `version: 1
name: Coder
models:
  - id: ${MODEL_ID}
    title: claude-sonnet-4.5
    provider: openrouter
    inputPrice: 3
    outputPrice: 15
prompts:
  - id: ${PROMPT_ID}
    name: Reviewer
    file: prompts/reviewer.md
agents:
${agentYaml(AGENT_ID, "EDITOR")}
${agentYaml(OTHER_AGENT_ID, "REVIEWER")}
links:
  - id: ${LINK_ID}
    from: ${AGENT_ID}
    to: ${OTHER_AGENT_ID}
`;

describe("ProjectConfigSerializer", () => {
  let serializer: ProjectConfigSerializer;

  before(() => {
    serializer = new ProjectConfigSerializer();
  });

  it("reads a project file into a validated config", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.equal(config.name, "Coder");
    assert.equal(config.models.length, 1);
    assert.equal(config.agents.length, 2);
    assert.equal(config.links.length, 1);
  });

  it("leaves a prompt's body to whoever reads its file", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.equal(config.prompts[0].file, "prompts/reviewer.md");
    assert.equal(config.prompts[0].text, "");
  });

  it("raises the file to the version this build writes", async () => {
    const config = await serializer.parse(VALID_YAML.replace("version: 1", "version: 0"));

    assert.equal(config.version, PROJECT_CONFIG_VERSION);
  });

  it("treats a missing list as an empty one", async () => {
    const config = await serializer.parse("version: 1\nname: Coder\n");

    assert.deepEqual(config.agents, []);
    assert.deepEqual(config.links, []);
  });

  it("refuses a file that is not a mapping", async () => {
    await assert.rejects(() => serializer.parse("- one\n- two\n"));
  });

  it("refuses an agent whose colour is not a hex colour", async () => {
    await assert.rejects(() => serializer.parse(VALID_YAML.replace('"#b18aff"', "violet")));
  });

  it("refuses a file whose lines close a ring, since work would walk it without end", async () => {
    await assert.rejects(
      () =>
        serializer.parse(
          VALID_YAML.replace(
            `links:
  - id: ${LINK_ID}
    from: ${AGENT_ID}
    to: ${OTHER_AGENT_ID}`,
            `links:
  - id: ${LINK_ID}
    from: ${AGENT_ID}
    to: ${OTHER_AGENT_ID}
  - id: ${COMMAND_ID}
    from: ${OTHER_AGENT_ID}
    to: ${AGENT_ID}`,
          ),
        ),
      new RegExp(LINKS_MAKE_RING),
    );
  });

  it("refuses a line drawn from an agent to itself, which is the shortest ring there is", async () => {
    await assert.rejects(
      () => serializer.parse(VALID_YAML.replace(`    to: ${OTHER_AGENT_ID}`, `    to: ${AGENT_ID}`)),
      new RegExp(LINKS_MAKE_RING),
    );
  });

  it("refuses the same line drawn twice, since one answer would go down it twice", async () => {
    await assert.rejects(
      () =>
        serializer.parse(
          VALID_YAML.replace(
            `links:
  - id: ${LINK_ID}
    from: ${AGENT_ID}
    to: ${OTHER_AGENT_ID}`,
            `links:
  - id: ${LINK_ID}
    from: ${AGENT_ID}
    to: ${OTHER_AGENT_ID}
  - id: ${COMMAND_ID}
    from: ${AGENT_ID}
    to: ${OTHER_AGENT_ID}`,
          ),
        ),
      new RegExp(LINKS_REPEAT),
    );
  });

  it("refuses two lines sharing an id, since everything that looks one up would find the wrong one", async () => {
    await assert.rejects(() =>
      serializer.parse(
        VALID_YAML.replace(
          `links:
  - id: ${LINK_ID}
    from: ${AGENT_ID}
    to: ${OTHER_AGENT_ID}`,
          `links:
  - id: ${LINK_ID}
    from: ${AGENT_ID}
    to: ${OTHER_AGENT_ID}
  - id: ${LINK_ID}
    from: ${OTHER_AGENT_ID}
    to: ${THIRD_AGENT_ID}`,
        ),
      ),
    );
  });

  it("refuses two agents sharing an id", async () => {
    await assert.rejects(() => serializer.parse(VALID_YAML.replace(OTHER_AGENT_ID, AGENT_ID)));
  });

  it("reads an agent without the prompt key as null, so an old file needs no migration", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.equal(config.agents[0].promptId, null);
  });

  it("reads an agent without the temperature key as unwritten, rather than standing it on a number", async () => {
    const config = await serializer.parse(VALID_YAML);

    // Missing number stays `null` («НЕ ЗАПОВНЕНО»).
    assert.equal(config.agents[0].temperature, null);
  });

  it("keeps the temperature an agent carries", async () => {
    const config = await serializer.parse(VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    temperature: 0.9"));

    assert.equal(config.agents[0].temperature, 0.9);
  });

  it("reads an agent without the wait key as waiting for all, so an old file needs no migration", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.equal(config.agents[0].waitsForAll, true);
  });

  it("keeps an agent set not to wait", async () => {
    const config = await serializer.parse(VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    waitsForAll: false"));

    assert.equal(config.agents[0].waitsForAll, false);
  });

  it("skips the old route switch of an agent without a word, and never writes it back", async () => {
    const config = await serializer.parse(VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    choosesRoute: true"));

    assert.equal("choosesRoute" in config.agents[0], false);
    assert.doesNotMatch(serializer.text(config.agents[0]), /choosesRoute/);
  });

  it("reads an agent without the memory key as keeping its own", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.equal(config.agents[0].memory, "own");
  });

  it("keeps an agent set to the run's shared memory", async () => {
    const config = await serializer.parse(VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    memory: shared"));

    assert.equal(config.agents[0].memory, "shared");
  });

  it("refuses a memory the app does not know", async () => {
    await assert.rejects(() => serializer.parse(VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    memory: all")));
  });

  it("refuses a temperature outside the bounds every provider takes", async () => {
    await assert.rejects(() =>
      serializer.parse(VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    temperature: 1.4")),
    );
  });

  it("reads an agent without the compression keys as unwritten, so an old file asks for them instead of inventing them", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.equal(config.agents[0].compressAt, null);
    assert.equal(config.agents[0].compressTo, null);
  });

  it("keeps the threshold and the target an agent carries", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    compressAt: 80\n    compressTo: 20"),
    );

    assert.equal(config.agents[0].compressAt, 80);
    assert.equal(config.agents[0].compressTo, 20);
  });

  it("reads a threshold or a target under its least as unwritten", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    compressAt: 69\n    compressTo: 9"),
    );

    assert.equal(config.agents[0].compressAt, null);
    assert.equal(config.agents[0].compressTo, null);
  });

  it("refuses a threshold or a target over its most", async () => {
    await assert.rejects(() => serializer.parse(VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    compressAt: 91")));
    await assert.rejects(() => serializer.parse(VALID_YAML.replace("maxCalls: 8", "maxCalls: 8\n    compressTo: 31")));
  });

  it("reads a model without the ceiling key as a field nobody has written", async () => {
    const config = await serializer.parse(VALID_YAML);

    // Nothing is filled in; the file still opens.
    assert.equal(config.models[0].contextCeiling, null);
  });

  it("keeps the ceiling a model carries", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace("outputPrice: 15", "outputPrice: 15\n    contextCeiling: 128000"),
    );

    assert.equal(config.models[0].contextCeiling, 128000);
  });

  it("takes a ceiling of nothing at all as unwritten, since a number below the least it may be is not one", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace("outputPrice: 15", "outputPrice: 15\n    contextCeiling: 0"),
    );

    // A wrongly written field does not refuse the file either.
    assert.equal(config.models[0].contextCeiling, null);
  });

  it("takes an answer's ceiling under the least a model may carry as unwritten, one token short of it too", async () => {
    const answer = await serializer.parse(
      VALID_YAML.replace("outputPrice: 15", "outputPrice: 15\n    answerCeiling: 1023"),
    );

    assert.equal(answer.models[0].answerCeiling, null);
  });

  it("refuses a ceiling past the most a model may carry, since that is a stray zero", async () => {
    await assert.rejects(() =>
      serializer.parse(VALID_YAML.replace("outputPrice: 15", "outputPrice: 15\n    contextCeiling: 1048577")),
    );
    await assert.rejects(() =>
      serializer.parse(VALID_YAML.replace("outputPrice: 15", "outputPrice: 15\n    answerCeiling: 524289")),
    );
  });

  it("reads a model without the answer's ceiling as a field nobody has written", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.equal(config.models[0].answerCeiling, null);
  });

  it("keeps the answer's ceiling a model carries", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace("outputPrice: 15", "outputPrice: 15\n    answerCeiling: 56000"),
    );

    assert.equal(config.models[0].answerCeiling, 56000);
  });

  it("takes an answer's ceiling of nothing at all as unwritten, the same as the context's", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace("outputPrice: 15", "outputPrice: 15\n    answerCeiling: 0"),
    );

    assert.equal(config.models[0].answerCeiling, null);
  });

  it("takes a price written as anything but a number as unwritten, and still opens the file", async () => {
    const config = await serializer.parse(VALID_YAML.replace("outputPrice: 15", 'outputPrice: "дорого"'));

    assert.equal(config.models[0].outputPrice, null);
    assert.equal(config.models[0].inputPrice, 3);
  });

  it("keeps the prompt an agent carries", async () => {
    const config = await serializer.parse(VALID_YAML.replace("maxCalls: 8", `promptId: ${PROMPT_ID}\n    maxCalls: 8`));

    assert.equal(config.agents[0].promptId, PROMPT_ID);
  });

  it("keeps a short description an agent carries", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace("maxCalls: 8", "purpose: Правлю код за описом зміни\n    maxCalls: 8"),
    );

    assert.equal(config.agents[0].purpose, "Правлю код за описом зміни");
  });

  it("refuses a prompt id that is not a uuid", async () => {
    await assert.rejects(() =>
      serializer.parse(VALID_YAML.replace("maxCalls: 8", "promptId: chatgpt\n    maxCalls: 8")),
    );
  });

  it("reads a file without the commands list as an empty one, so an old file needs no migration", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.deepEqual(config.commands, []);
  });

  it("keeps a declared command and its parameters", async () => {
    const config = await serializer.parse(
      `${VALID_YAML}\ncommands:\n  - id: ${COMMAND_ID}\n    name: run_tests\n    description: Прогнати тести\n    run: npm test -- {pattern}\n    parameters:\n      - id: ${PARAMETER_ID}\n        name: pattern\n        type: text\n        description: Маска файлів тестів\n        isRequired: false\n`,
    );

    assert.equal(config.commands[0].name, "run_tests");
    assert.equal(config.commands[0].parameters[0].type, "text");
  });

  it("keeps the values an enum allows, and leaves every other type with none", async () => {
    const config = await serializer.parse(
      `${VALID_YAML}\ncommands:\n  - id: ${COMMAND_ID}\n    name: run_tests\n    description: Прогнати тести\n    run: npm test --reporter={format}\n    parameters:\n      - id: ${PARAMETER_ID}\n        name: format\n        type: enum\n        description: Формат звіту\n        isRequired: false\n        values:\n          - dot\n          - spec\n`,
    );

    assert.deepEqual(config.commands[0].parameters[0].values, ["dot", "spec"]);
  });

  it("reads a parameter written before values existed as allowing none", async () => {
    const config = await serializer.parse(
      `${VALID_YAML}\ncommands:\n  - id: ${COMMAND_ID}\n    name: run_tests\n    description: Прогнати тести\n    run: npm test\n    parameters:\n      - id: ${PARAMETER_ID}\n        name: pattern\n        type: text\n        description: Маска\n        isRequired: false\n`,
    );

    assert.deepEqual(config.commands[0].parameters[0].values, []);
  });

  it("refuses a parameter of a type nobody declared", async () => {
    await assert.rejects(() =>
      serializer.parse(
        `${VALID_YAML}\ncommands:\n  - id: ${COMMAND_ID}\n    name: run_tests\n    description: Прогнати тести\n    run: npm test\n    parameters:\n      - id: ${PARAMETER_ID}\n        name: pattern\n        type: date\n        description: Маска\n        isRequired: false\n`,
      ),
    );
  });

  it("reads an agent without the tools list as an empty one, so an old file needs no migration", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.deepEqual(config.agents[0].tools, []);
  });

  it("keeps a granted command, and the kind the grant names itself", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace(
        "    maxCalls: 8",
        `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: command\n        commandId: ${COMMAND_ID}\n`,
      ),
    );

    assert.equal(config.agents[0].tools[0].source, "command");
    assert.equal(config.agents[0].tools[0].commandId, COMMAND_ID);
  });

  it("refuses a grant that names a kind nobody declared", async () => {
    await assert.rejects(() =>
      serializer.parse(
        VALID_YAML.replace(
          "    maxCalls: 8",
          `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: mcp\n        commandId: ${COMMAND_ID}\n`,
        ),
      ),
    );
  });

  it("refuses the same function granted to one agent twice", async () => {
    await assert.rejects(() =>
      serializer.parse(
        VALID_YAML.replace(
          "    maxCalls: 8",
          `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: command\n        commandId: ${COMMAND_ID}\n      - id: ${PARAMETER_ID}\n        source: command\n        commandId: ${COMMAND_ID}\n`,
        ),
      ),
    );
  });

  it("keeps the arguments a grant fixes for this agent alone", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace(
        "    maxCalls: 8",
        `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: command\n        commandId: ${COMMAND_ID}\n        pinned:\n          - id: ${PARAMETER_ID}\n            parameterId: ${PROMPT_ID}\n            value: auth/*.spec.ts\n`,
      ),
    );

    const grant = config.agents[0].tools[0];

    assert.equal(grant.source, "command");
    assert.equal((<CommandToolGrantDto>grant).pinned[0].value, "auth/*.spec.ts");
  });

  it("refuses the same parameter fixed twice in one grant", async () => {
    await assert.rejects(() =>
      serializer.parse(
        VALID_YAML.replace(
          "    maxCalls: 8",
          `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: command\n        commandId: ${COMMAND_ID}\n        pinned:\n          - id: ${PARAMETER_ID}\n            parameterId: ${PROMPT_ID}\n            value: one\n          - id: ${LINK_ID}\n            parameterId: ${PROMPT_ID}\n            value: two\n`,
        ),
      ),
    );
  });

  it("writes the absence of a prompt as an explicit null, so an agent's file says it rather than omits it", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.match(serializer.text(config.agents[0]), /promptId: null/);
  });

  it("reads a described thing's own file as the plain record it is", () => {
    assert.deepEqual(serializer.partSource("name: EDITOR\nmaxCalls: 8\n"), {
      name: "EDITOR",
      maxCalls: 8,
    });
  });

  it("refuses a described thing's file that holds nothing anybody can read", () => {
    assert.throws(() => serializer.partSource(""));
  });

  it("refuses a file stamped with a version this build does not know", async () => {
    await assert.rejects(
      () => serializer.parse(`version: ${PROJECT_CONFIG_VERSION + 1}\nname: from tomorrow\n`),
      new RegExp(PROJECT_FROM_NEWER_BUILD),
    );
  });

  it("raises a file stamped with an older version to the one this build writes", async () => {
    const config = await serializer.parse("version: 0\nname: from yesterday\n");

    assert.equal(config.version, PROJECT_CONFIG_VERSION);
  });

  it("reads a local server as the line that starts it, with no address and no way in", async () => {
    const config = await serializer.parse(VALID_YAML + serversYaml(LOCAL_SERVER_YAML));

    assert.equal(config.servers.length, 1);
    assert.equal(config.servers[0].name, "filesystem");
    assert.equal(config.servers[0].isLocal, true);
    assert.equal(config.servers[0].run, "npx @modelcontextprotocol/server-filesystem .");
    // The other kind's fields are empty, not absent.
    assert.equal(config.servers[0].address, "");
    assert.equal(config.servers[0].signIn, "none");
  });

  it("reads a server's environment variables as names, and a server declaring none as an empty list", async () => {
    // The name is in the file; the value stays in the keychain.
    const config = await serializer.parse(VALID_YAML + serversYaml(SERVER_WITH_ENV_YAML));
    const bare = await serializer.parse(VALID_YAML + serversYaml(LOCAL_SERVER_YAML));

    assert.deepEqual(config.servers[0].env, ["BRAVE_API_KEY", "BRAVE_REGION"]);
    assert.deepEqual(bare.servers[0].env, []);
  });

  it("reads a remote server as its address and the way in, with no line to run", async () => {
    const config = await serializer.parse(VALID_YAML + serversYaml(REMOTE_SERVER_YAML));

    assert.equal(config.servers[0].isLocal, false);
    assert.equal(config.servers[0].address, "https://mcp.linear.app/sse");
    assert.equal(config.servers[0].signIn, "token");
    assert.equal(config.servers[0].run, "");
  });

  it("keeps no token: the file names only the way in, and the keychain holds the rest", async () => {
    const config = await serializer.parse(
      VALID_YAML + serversYaml(`${REMOTE_SERVER_YAML}\n    token: sk-must-never-be-read`),
    );

    assert.equal(Object.hasOwn(config.servers[0], "token"), false);
    assert.equal(serializer.text(config.servers[0]).includes("sk-must-never-be-read"), false);
  });

  it("refuses a way into a server nobody knows", async () => {
    await assert.rejects(() =>
      serializer.parse(VALID_YAML + serversYaml(REMOTE_SERVER_YAML.replace("token", "by post"))),
    );
  });

  it("refuses two servers under one name, since the catalogue names them and nothing else", async () => {
    await assert.rejects(() =>
      serializer.parse(VALID_YAML + serversYaml(LOCAL_SERVER_YAML, REMOTE_SERVER_YAML.replace("linear", "filesystem"))),
    );
  });

  it("a file written before servers existed reads as a project with none", async () => {
    const config = await serializer.parse(VALID_YAML);

    assert.deepEqual(config.servers, []);
  });

  it("reads a granted server function by the name the server gave it", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace(
        "    maxCalls: 8",
        `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: mcp\n        serverId: ${SERVER_ID}\n        functionName: read_file\n`,
      ) + serversYaml(LOCAL_SERVER_YAML),
    );
    const grant = config.agents[0].tools[0];

    assert.equal(grant.source, "mcp");
    assert.equal((<McpToolGrantDto>grant).serverId, SERVER_ID);
    assert.equal((<McpToolGrantDto>grant).functionName, "read_file");
  });

  it("reads a system command granted to an agent", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace(
        "    maxCalls: 8",
        `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: system\n        command: pass_to\n`,
      ),
    );
    const [grant] = config.agents[0].tools;

    assert.equal(grant.source, "system");
    assert.equal((<SystemToolGrantDto>grant).command, "pass_to");
  });

  it("refuses a system command nobody declared", async () => {
    await assert.rejects(() =>
      serializer.parse(
        VALID_YAML.replace(
          "    maxCalls: 8",
          `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: system\n        command: rm_rf\n`,
        ),
      ),
    );
  });

  it("refuses one system command granted to an agent twice", async () => {
    await assert.rejects(() =>
      serializer.parse(
        VALID_YAML.replace(
          "    maxCalls: 8",
          `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: system\n        command: pass_to\n      - id: ${COMMAND_ID}\n        source: system\n        command: pass_to\n`,
        ),
      ),
    );
  });

  it("takes the same function name on two servers as two different things", async () => {
    const config = await serializer.parse(
      VALID_YAML.replace(
        "    maxCalls: 8",
        `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: mcp\n        serverId: ${SERVER_ID}\n        functionName: search\n      - id: ${COMMAND_ID}\n        source: mcp\n        serverId: ${OTHER_SERVER_ID}\n        functionName: search\n`,
      ) + serversYaml(LOCAL_SERVER_YAML, REMOTE_SERVER_YAML),
    );

    assert.equal(config.agents[0].tools.length, 2);
  });

  it("refuses one function of one server granted to an agent twice", async () => {
    await assert.rejects(() =>
      serializer.parse(
        VALID_YAML.replace(
          "    maxCalls: 8",
          `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: mcp\n        serverId: ${SERVER_ID}\n        functionName: search\n      - id: ${COMMAND_ID}\n        source: mcp\n        serverId: ${SERVER_ID}\n        functionName: search\n`,
        ) + serversYaml(LOCAL_SERVER_YAML),
      ),
    );
  });

  it("refuses a grant whose source nobody knows, rather than dropping it quietly", async () => {
    await assert.rejects(() =>
      serializer.parse(
        VALID_YAML.replace(
          "    maxCalls: 8",
          `    maxCalls: 8
    tools:\n      - id: ${GRANT_ID}\n        source: telepathy\n`,
        ),
      ),
    );
  });
});
