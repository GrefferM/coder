import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";
import { ProjectConfigDto, ProjectPromptDto } from "../dto";
import { AGENT_SKELETON_STEP_PX, PROJECT_CONFIG_VERSION } from "../constants";
import { ProjectConfigSerializer } from "./project-config-serializer.service";
import { ProjectFileService } from "./project-file.service";
import { ProjectFileReader } from "./project-file-reader.service";
import { ProjectFileWriter } from "./project-file-writer.service";
import { ProjectFolder } from "./project-folder.service";

function configWithPrompt(text: string, file = ""): ProjectConfigDto {
  const prompt = new ProjectPromptDto();

  prompt.id = "55555555-5555-4555-8555-555555555555";
  prompt.name = "Code Reviewer";
  prompt.file = file;
  prompt.text = text;

  const config = new ProjectConfigDto();

  config.version = PROJECT_CONFIG_VERSION;
  config.name = "Coder";
  config.models = [];
  config.servers = [];
  config.prompts = [prompt];
  config.agents = [];
  config.links = [];

  return config;
}

const MODEL_ID = "11111111-1111-4111-8111-111111111111";
const AGENT_ID = "22222222-2222-4222-8222-222222222222";
const COMMAND_ID = "66666666-6666-4666-8666-666666666666";
const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const SCHEDULE_ID = "77777777-7777-4777-8777-777777777777";

/** A project with one of everything. */
function fullConfig(): Record<string, unknown> {
  return {
    version: PROJECT_CONFIG_VERSION,
    name: "Coder",
    models: [
      {
        id: MODEL_ID,
        title: "claude-sonnet-4.5",
        provider: "anthropic",
        inputPrice: 3,
        outputPrice: 15,
        contextCeiling: 128000,
        answerCeiling: 4096,
      },
    ],
    prompts: [],
    commands: [
      {
        id: COMMAND_ID,
        name: "run_tests",
        description: "Runs the tests.",
        run: "npm test",
        parameters: [],
      },
    ],
    servers: [
      {
        id: SERVER_ID,
        name: "filesystem",
        isLocal: true,
        run: "npx server-filesystem .",
        address: "",
        signIn: "none",
        env: [],
      },
    ],
    agents: [
      {
        id: AGENT_ID,
        name: "EDITOR",
        modelId: MODEL_ID,
        promptId: null,
        tools: [],
        color: "#b18aff",
        isActive: true,
        x: 10,
        y: 20,
        maxCalls: 8,
      },
    ],
    links: [],
    schedules: [
      {
        id: SCHEDULE_ID,
        agentId: AGENT_ID,
        task: "Перевір, чи зелений main.",
        everyMinutes: 30,
      },
    ],
  };
}

const folder = new ProjectFolder();

describe("ProjectFileService", () => {
  let projectFileService: ProjectFileService;
  let projectDirectory: string;

  beforeEach(async () => {
    const serializer = new ProjectConfigSerializer();
    const reader = new ProjectFileReader(serializer, folder);
    const writer = new ProjectFileWriter(serializer, folder, reader);

    projectFileService = new ProjectFileService(reader, writer);
    projectDirectory = await mkdtemp(path.join(os.tmpdir(), "coder-project-"));
  });

  it("writes a prompt into its own file, named by the prompt's id", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    const body = await readFile(
      path.join(projectDirectory, "prompts", "55555555-5555-4555-8555-555555555555.md"),
      "utf8",
    );

    assert.equal(body, "Read the diff.");
  });

  it("leaves a prompt whose own file is gone out of the library, rather than reading it as empty", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));
    await rm(path.join(projectDirectory, "prompts", "55555555-5555-4555-8555-555555555555.md"));

    const config = await projectFileService.read(projectDirectory);

    // A lost prompt is not restored.
    assert.deepEqual(config.prompts, []);
  });

  it("keeps a prompt whose file is there and empty, since an empty prompt is one the person wrote", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt(""));

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.prompts.length, 1);
    assert.equal(config.prompts[0].text, "");
  });

  it("leaves the file where it is when the prompt is renamed, since the name is not in it", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    const renamed = configWithPrompt("Read the diff.");

    renamed.prompts[0].name = "Виконавець";
    await projectFileService.write(projectDirectory, renamed);

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.prompts[0].file, path.join("prompts", "55555555-5555-4555-8555-555555555555.md"));
    assert.equal(config.prompts[0].name, "Виконавець");
  });

  it("moves a file written under the older rule instead of leaving it beside the new one", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff.", "prompts/code-reviewer.md"));
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    await assert.rejects(() => readFile(path.join(projectDirectory, "prompts", "code-reviewer.md"), "utf8"));

    const body = await readFile(
      path.join(projectDirectory, "prompts", "55555555-5555-4555-8555-555555555555.md"),
      "utf8",
    );

    assert.equal(body, "Read the diff.");
  });

  it("takes the file of a deleted prompt away with it, leaving nothing in the folder", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    const empty = configWithPrompt("Read the diff.");

    empty.prompts = [];
    await projectFileService.write(projectDirectory, empty);

    await assert.rejects(() =>
      readFile(path.join(projectDirectory, "prompts", "55555555-5555-4555-8555-555555555555.md"), "utf8"),
    );
  });

  it("brings a deleted prompt's body back when the step back is written again", async () => {
    const held = configWithPrompt("Read the diff.");

    await projectFileService.write(projectDirectory, held);

    const empty = configWithPrompt("Read the diff.");

    empty.prompts = [];
    await projectFileService.write(projectDirectory, empty);
    await projectFileService.write(projectDirectory, held);

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.prompts[0].text, "Read the diff.");
  });

  it("reads a project back with every prompt body in place", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.prompts[0].text, "Read the diff.");
    assert.equal(config.prompts[0].file, path.join("prompts", "55555555-5555-4555-8555-555555555555.md"));
  });

  it("writes nothing back for a prompt whose file is gone, so a read does not undo a deletion", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));
    await rm(path.join(projectDirectory, "prompts", "55555555-5555-4555-8555-555555555555.md"));

    const read = await projectFileService.read(projectDirectory);

    await projectFileService.write(projectDirectory, read);

    await assert.rejects(() =>
      readFile(path.join(projectDirectory, "prompts", "55555555-5555-4555-8555-555555555555.md"), "utf8"),
    );
  });

  it("writes every described thing into its own file, and the project file holds only references", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));

    const index = await readFile(path.join(projectDirectory, "project.yaml"), "utf8");

    assert.match(index, new RegExp(`file: agents/${AGENT_ID}.yaml`));
    assert.match(index, new RegExp(`file: models/${MODEL_ID}.yaml`));
    assert.match(index, new RegExp(`file: commands/${COMMAND_ID}.yaml`));
    assert.match(index, new RegExp(`file: servers/${SERVER_ID}.yaml`));
    assert.doesNotMatch(index, /EDITOR/);
    assert.doesNotMatch(index, /npm test/);
    // A server has no ties, so nothing of it, including its run line, is in the project file.
    assert.doesNotMatch(index, /server-filesystem/);

    const agent = await readFile(path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`), "utf8");

    assert.match(agent, /name: EDITOR/);
    // The id stays in the project file's reference.
    assert.doesNotMatch(agent, new RegExp(`id: ${AGENT_ID}`));
    // Ties stay in the project file too.
    assert.doesNotMatch(agent, /modelId/);
    assert.match(index, new RegExp(`modelId: ${MODEL_ID}`));

    // A model's provider is a tie: it stands in the project file.
    assert.match(index, /provider: anthropic/);
    assert.doesNotMatch(await readFile(path.join(projectDirectory, "models", `${MODEL_ID}.yaml`), "utf8"), /provider/);
  });

  it("keeps both of a model's ceilings in its own file, so the numbers a person wrote stand the next read", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));

    const model = await readFile(path.join(projectDirectory, "models", `${MODEL_ID}.yaml`), "utf8");

    assert.match(model, /contextCeiling: 128000/);
    assert.match(model, /answerCeiling: 4096/);

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.models[0].contextCeiling, 128000);
    assert.equal(config.models[0].answerCeiling, 4096);
  });

  it("reads a model whose file names no kind as a text model, and writes the kind down on the next save", async () => {
    const serializer = new ProjectConfigSerializer();

    await mkdir(projectDirectory, {
      recursive: true,
    });
    await writeFile(path.join(projectDirectory, "project.yaml"), serializer.text(fullConfig()), "utf8");

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.models[0].kind, "text");

    await projectFileService.write(projectDirectory, config);

    assert.match(await readFile(path.join(projectDirectory, "models", `${MODEL_ID}.yaml`), "utf8"), /kind: text/);
  });

  it("keeps a recognition model's kind in its own file, and the project's choice of it in the project file", async () => {
    const serializer = new ProjectConfigSerializer();
    const source = fullConfig();
    const [model] = <Record<string, unknown>[]>source.models;

    model.kind = "listen";
    source.speech = {
      listenModelId: MODEL_ID,
    };

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(source));

    const index = await readFile(path.join(projectDirectory, "project.yaml"), "utf8");

    assert.match(index, new RegExp(`listenModelId: ${MODEL_ID}`));
    assert.match(await readFile(path.join(projectDirectory, "models", `${MODEL_ID}.yaml`), "utf8"), /kind: listen/);

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.models[0].kind, "listen");
    assert.equal(config.speech.listenModelId, MODEL_ID);
  });

  it("reads a project that never chose how to hear as having chosen nothing", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.speech.listenModelId, null);
  });

  it("puts an empty skeleton where a description is gone, instead of refusing the project", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));
    await rm(path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`));

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.agents[0].name, "unknown");
    // The tie stands in the project file.
    assert.equal(config.agents[0].modelId, MODEL_ID);
    // A read writes nothing: a removed file does not come back.
    await assert.rejects(readFile(path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`), "utf8"));
  });

  it("writes the part back on the next save, so the skeleton is mended by a write and not by a read", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));
    await rm(path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`));

    const config = await projectFileService.read(projectDirectory);

    await projectFileService.write(projectDirectory, config);

    assert.match(await readFile(path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`), "utf8"), /name: unknown/);
  });

  it("lays restored agents out in a row, since a lost file takes the place on the canvas with it", async () => {
    const serializer = new ProjectConfigSerializer();
    const two = await serializer.toValidConfig(fullConfig());
    const other = {
      ...two.agents[0],
      id: "77777777-7777-4777-8777-777777777777",
      name: "TESTER",
    };

    two.agents = [two.agents[0], <typeof other>other];
    await projectFileService.write(projectDirectory, two);
    await rm(path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`));
    await rm(path.join(projectDirectory, "agents", "77777777-7777-4777-8777-777777777777.yaml"));

    const config = await projectFileService.read(projectDirectory);

    // Both spheres are drawn, and never one on top of the other.
    assert.equal(config.agents[0].x, 0);
    assert.equal(config.agents[1].x, AGENT_SKELETON_STEP_PX);
    assert.notEqual(config.agents[0].x, config.agents[1].x);
  });

  it("leaves a model whose own file is gone out of the catalogue, rather than inventing one", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));
    await rm(path.join(projectDirectory, "models", `${MODEL_ID}.yaml`));

    const config = await projectFileService.read(projectDirectory);

    // A lost model is not restored.
    assert.deepEqual(config.models, []);
    assert.equal(config.agents[0].modelId, MODEL_ID);
  });

  it("leaves a command whose own file is gone out too, so no model is offered a function nobody wrote", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));
    await rm(path.join(projectDirectory, "commands", `${COMMAND_ID}.yaml`));

    const config = await projectFileService.read(projectDirectory);

    assert.deepEqual(config.commands, []);
    // A grant stays in the project file, for the agent's tab to show as lost.
    assert.equal(config.agents[0].id, AGENT_ID);
  });

  it("writes a server into its own file, the way to reach it and nothing that moves", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));

    const server = await readFile(path.join(projectDirectory, "servers", `${SERVER_ID}.yaml`), "utf8");

    assert.match(server, /name: filesystem/);
    assert.match(server, /run: npx server-filesystem \./);
    // The id stays in the project file's reference.
    assert.doesNotMatch(server, new RegExp(`id: ${SERVER_ID}`));
    // A token is never written; the file names only the sign-in kind.
    assert.doesNotMatch(server, /token/);
  });

  it("leaves a server whose own file is gone out, the same as a command", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));
    await rm(path.join(projectDirectory, "servers", `${SERVER_ID}.yaml`));

    const config = await projectFileService.read(projectDirectory);

    assert.deepEqual(config.servers, []);
  });

  it("writes a schedule into its own file, its task and interval, and its agent in the project file", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));

    const index = await readFile(path.join(projectDirectory, "project.yaml"), "utf8");
    const schedule = await readFile(path.join(projectDirectory, "schedules", `${SCHEDULE_ID}.yaml`), "utf8");

    assert.match(index, new RegExp(`file: schedules/${SCHEDULE_ID}.yaml`));
    assert.match(index, new RegExp(`agentId: ${AGENT_ID}`));
    assert.doesNotMatch(index, /main/);
    assert.match(schedule, /task: Перевір, чи зелений main\./);
    assert.match(schedule, /everyMinutes: 30/);
    assert.doesNotMatch(schedule, /agentId/);
  });

  it("reads a schedule whose file names no interval as one not written yet, rather than refusing the project", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));
    await writeFile(path.join(projectDirectory, "schedules", `${SCHEDULE_ID}.yaml`), "task: Перевір main.\n", "utf8");

    const [schedule] = (await projectFileService.read(projectDirectory)).schedules;

    assert.equal(schedule.task, "Перевір main.");
    assert.equal(schedule.everyMinutes, null);
  });

  it("leaves a schedule whose own file is gone out, so nothing is asked on a task nobody wrote", async () => {
    const serializer = new ProjectConfigSerializer();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));
    await rm(path.join(projectDirectory, "schedules", `${SCHEDULE_ID}.yaml`));

    const config = await projectFileService.read(projectDirectory);

    assert.deepEqual(config.schedules, []);
  });

  it("takes the file of a deleted schedule away with it", async () => {
    const serializer = new ProjectConfigSerializer();
    const config = await serializer.toValidConfig(fullConfig());

    await projectFileService.write(projectDirectory, config);

    config.schedules = [];

    await projectFileService.write(projectDirectory, config);

    assert.deepEqual(await readdir(path.join(projectDirectory, "schedules")), []);
  });

  it("reads a split project back whole, exactly as it was written", async () => {
    const serializer = new ProjectConfigSerializer();
    const written = await serializer.toValidConfig(fullConfig());

    await projectFileService.write(projectDirectory, written);

    assert.deepEqual(await projectFileService.read(projectDirectory), written);
  });

  it("reads a project written by an older build, where everything stood in the one file", async () => {
    const serializer = new ProjectConfigSerializer();

    await mkdir(projectDirectory, {
      recursive: true,
    });
    await writeFile(path.join(projectDirectory, "project.yaml"), serializer.text(fullConfig()), "utf8");

    const config = await projectFileService.read(projectDirectory);

    assert.equal(config.agents[0].name, "EDITOR");

    await projectFileService.write(projectDirectory, config);

    assert.match(await readFile(path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`), "utf8"), /name: EDITOR/);
  });

  it("keeps the agent's system commands in its own file, and reads them back as written", async () => {
    const serializer = new ProjectConfigSerializer();
    const source = fullConfig();
    const [agent] = <Record<string, unknown>[]>source.agents;

    agent.tools = [
      {
        id: "99999999-9999-4999-8999-999999999999",
        source: "system",
        command: "pass_to",
      },
    ];

    const written = await serializer.toValidConfig(source);

    await projectFileService.write(projectDirectory, written);

    assert.match(
      await readFile(path.join(projectDirectory, "project.yaml"), "utf8"),
      /source: system\n\s+command: pass_to/,
    );
    assert.equal(
      (<{ command: string }>(await projectFileService.read(projectDirectory)).agents[0].tools[0]).command,
      "pass_to",
    );
  });

  it("takes the file of a deleted agent away with it", async () => {
    const serializer = new ProjectConfigSerializer();
    const held = fullConfig();

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(held));
    await projectFileService.write(
      projectDirectory,
      await serializer.toValidConfig({
        ...held,
        agents: [],
      }),
    );

    assert.deepEqual(await readdir(path.join(projectDirectory, "agents")), []);
  });

  it("leaves alone whatever somebody else put in the folders, and never reads it either", async () => {
    const serializer = new ProjectConfigSerializer();
    const stray = path.join(projectDirectory, "agents", "чернетка.yaml");

    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));
    await writeFile(stray, "name: моя чернетка\n", "utf8");
    await projectFileService.write(projectDirectory, await serializer.toValidConfig(fullConfig()));

    assert.equal(await readFile(stray, "utf8"), "name: моя чернетка\n");

    const config = await projectFileService.read(projectDirectory);

    // Parts come from the project file's references, not from the folder.
    assert.equal(config.agents.length, 1);
    assert.equal(config.agents[0].name, "EDITOR");
  });

  it("writes the config through a temporary file, leaving none behind", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    const filePath = folder.filePath(projectDirectory);

    await assert.rejects(() => readFile(`${filePath}.tmp`, "utf8"));
    assert.match(await readFile(filePath, "utf8"), /name: Coder/);
  });

  it("writes a prompt through a temporary file too, leaving none behind", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    const promptPath = path.join(projectDirectory, "prompts", "code-reviewer.md");

    await assert.rejects(() => readFile(`${promptPath}.tmp`, "utf8"));
  });

  it("leaves a part's file exactly as it stands when nothing in it changed", async () => {
    const serializer = new ProjectConfigSerializer();
    const config = await serializer.toValidConfig(fullConfig());

    await projectFileService.write(projectDirectory, config);

    const agentPath = path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`);
    const first = await stat(agentPath);

    await projectFileService.write(projectDirectory, config);

    // An atomic write renames a fresh file into place, so an unchanged file keeps its inode.
    assert.equal((await stat(agentPath)).ino, first.ino);
  });

  it("writes a part's file again the moment something in it changed", async () => {
    const serializer = new ProjectConfigSerializer();
    const config = await serializer.toValidConfig(fullConfig());

    await projectFileService.write(projectDirectory, config);

    const agentPath = path.join(projectDirectory, "agents", `${AGENT_ID}.yaml`);
    const first = await stat(agentPath);

    config.agents[0].x = 320;

    await projectFileService.write(projectDirectory, config);

    assert.notEqual((await stat(agentPath)).ino, first.ino);
    assert.match(await readFile(agentPath, "utf8"), /x: 320/);
  });

  it("leaves the other parts alone when one thing moved", async () => {
    const serializer = new ProjectConfigSerializer();
    const config = await serializer.toValidConfig(fullConfig());

    await projectFileService.write(projectDirectory, config);

    const modelPath = path.join(projectDirectory, "models", `${MODEL_ID}.yaml`);
    const commandPath = path.join(projectDirectory, "commands", `${COMMAND_ID}.yaml`);
    const model = await stat(modelPath);
    const command = await stat(commandPath);

    config.agents[0].y = 44;

    await projectFileService.write(projectDirectory, config);

    assert.equal((await stat(modelPath)).ino, model.ino);
    assert.equal((await stat(commandPath)).ino, command.ino);
  });

  it("leaves a prompt's file as it stands when its body did not change", async () => {
    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    const promptPath = path.join(projectDirectory, "prompts", "55555555-5555-4555-8555-555555555555.md");
    const first = await stat(promptPath);

    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff."));

    assert.equal((await stat(promptPath)).ino, first.ino);

    await projectFileService.write(projectDirectory, configWithPrompt("Read the diff twice."));

    assert.notEqual((await stat(promptPath)).ino, first.ino);
    assert.equal(await readFile(promptPath, "utf8"), "Read the diff twice.");
  });

  it("writes the project file itself on every save, since it is the index the parts hang off", async () => {
    const serializer = new ProjectConfigSerializer();
    const config = await serializer.toValidConfig(fullConfig());

    await projectFileService.write(projectDirectory, config);

    const first = await stat(folder.filePath(projectDirectory));

    await projectFileService.write(projectDirectory, config);

    assert.notEqual((await stat(folder.filePath(projectDirectory))).ino, first.ino);
  });

  it("leaves the same project on disk after a save that changed nothing", async () => {
    const serializer = new ProjectConfigSerializer();
    const config = await serializer.toValidConfig(fullConfig());

    await projectFileService.write(projectDirectory, config);
    await projectFileService.write(projectDirectory, config);

    assert.deepEqual(await projectFileService.read(projectDirectory), config);
    assert.deepEqual((await readdir(path.join(projectDirectory, "agents"))).sort(), [`${AGENT_ID}.yaml`]);
  });
});
