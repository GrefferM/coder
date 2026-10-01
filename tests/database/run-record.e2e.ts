import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createRunModule } from "../../src/modules/runs";
import {
  AddCallDto,
  AddStepDto,
  AskAgainDto,
  AttachedDto,
  CloseRunDto,
  ForgetRunDto,
  ForgetRunsDto,
  ListRunsDto,
  OpenRunDto,
  ReadRunDto,
} from "../../src/modules/runs/dto";
import {
  RunCallEntity,
  RunEntity,
  RunQuestionAttachmentEntity,
  RunQuestionEntity,
  RunStepEntity,
} from "../../src/modules/runs/entities";
import { openTestDatabase } from "../../src/utils/testing";
import type { DataSource } from "typeorm";
import type { TestDatabase } from "../../src/utils/testing";
import type { RunController } from "../../src/modules/runs/controllers";

const DIRECTORY = "/tmp/coder-project";
const OTHER_DIRECTORY = "/tmp/other-project";
const SEEKER = "22222222-2222-4222-8222-222222222222";
const QUESTION = "44444444-4444-4444-8444-444444444444";
const WALK = "77777777-7777-4777-8777-777777777777";
const ASKED_AT = 1_700_000_000_000;

/** The record's own database for this test; never the app's. */
let record: TestDatabase;
let dataSource: DataSource;
let door: RunController;

function doorOver(source: DataSource): RunController {
  return createRunModule(source).controller;
}

function opening(patch: Record<string, unknown> = {}): OpenRunDto {
  return Object.assign(new OpenRunDto(), {
    directory: DIRECTORY,
    startedByAgentId: SEEKER,
    startedByAgentName: "Шукач",
    startedByAgentColor: "#6fd3d8",
    questionId: QUESTION,
    asked: "Знайди md-файли",
    attached: [],
    startedAt: ASKED_AT,
    ...patch,
  });
}

/** One file or folder sent with a question, as the bridge rebuilds it. */
function attachment(patch: Record<string, unknown> = {}): AttachedDto {
  return Object.assign(new AttachedDto(), {
    path: "/tmp/coder-project/notes.md",
    name: "notes.md",
    kind: "file",
    text: "=== notes.md ===\n# Нотатки",
    binaries: [],
    ...patch,
  });
}

function step(runId: string, patch: Record<string, unknown> = {}): AddStepDto {
  return Object.assign(new AddStepDto(), {
    runId,
    questionId: QUESTION,
    walkId: WALK,
    agentId: SEEKER,
    agentName: "Шукач",
    agentColor: "#6fd3d8",
    modelId: "model-1",
    model: "deepseek/deepseek-v4-flash",
    providerId: "openrouter",
    inputPrice: 3,
    outputPrice: 15,
    contextCeiling: 700_000,
    answerCeiling: 4_096,
    promptId: "prompt-1",
    prompt: "Ти шукаєш файли.",
    temperature: 0,
    maxCalls: 8,
    memoryLength: 0,
    asked: "Знайди md-файли",
    said: "ЗНАЙДЕНО\n- report.md",
    state: "done",
    inputTokens: 2_263,
    outputTokens: 1_068,
    money: 0.0031,
    fromStepIds: [],
    handoffs: [],
    startedAt: ASKED_AT + 900,
    endedAt: ASKED_AT + 2_000,
    calls: [],
    ...patch,
  });
}

describe("the record on a real database of its own", () => {
  beforeEach(async () => {
    record = await openTestDatabase();
    dataSource = record.dataSource;
    door = doorOver(dataSource);
  });

  afterEach(async () => {
    await record.close(dataSource);
  });

  it("keeps what it wrote after the connection is closed and opened again", async () => {
    // Nothing is remembered by the writing process; data must be in the file.
    const opened = await door.open(opening());

    await door.step(step(opened.runId));
    await door.close(
      Object.assign(new CloseRunDto(), {
        runId: opened.runId,
        endedAt: ASKED_AT + 3_000,
      }),
    );
    dataSource = await record.reopen();
    door = doorOver(dataSource);

    const rows = await door.list(
      Object.assign(new ListRunsDto(), {
        directory: DIRECTORY,
      }),
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, opened.runId);
    assert.equal(rows[0].steps, 1);
  });

  it("brings the numbers back as they were written, not as something near them", async () => {
    // Money and tokens survive SQLite types: $0.0031 does not read back as $0.
    const opened = await door.open(opening());

    await door.step(step(opened.runId));

    const whole = await door.one(
      Object.assign(new ReadRunDto(), {
        id: opened.runId,
      }),
    );

    assert.equal(whole?.money, 0.0031);
    assert.equal(whole?.walk[0].inputTokens, 2_263);
    assert.equal(whole?.walk[0].outputTokens, 1_068);
    assert.equal(whole?.walk[0].said, "ЗНАЙДЕНО\n- report.md");
    // Hours come back as hours, not as the numbers they were sent as.
    assert.ok(whole?.startedAt instanceof Date);
    assert.equal(whole?.startedAt.getTime(), ASKED_AT);
  });

  it("keeps each project's runs to that project", async () => {
    // One file, many folders: a project's history shows only its own runs.
    const mine = await door.open(opening());

    await door.open(
      opening({
        directory: OTHER_DIRECTORY,
        questionId: "55555555-5555-4555-8555-555555555555",
      }),
    );

    const rows = await door.list(
      Object.assign(new ListRunsDto(), {
        directory: DIRECTORY,
      }),
    );

    assert.deepEqual(
      rows.map((row) => row.id),
      [mine.runId],
    );
  });

  it("takes a run's steps, calls, questions and attachments with it when the run goes", async () => {
    // Deleting a run removes it and everything of it in other tables.
    const opened = await door.open(
      opening({
        attached: [attachment()],
      }),
    );

    await door.step(
      step(opened.runId, {
        calls: [
          Object.assign(new AddCallDto(), {
            // A call keeps its existing id; the record mints none.
            id: crypto.randomUUID(),
            source: "command",
            name: "find_deep",
            arguments: {
              mask: "*.md",
            },
            pinned: [],
            line: "find . -name '*.md'",
            output: "report.md",
            refusal: "",
            exitCode: 0,
            serverId: null,
            serverName: "",
            end: "ran",
            startedAt: ASKED_AT + 1_000,
            endedAt: ASKED_AT + 1_400,
          }),
        ],
      }),
    );

    assert.equal(
      await door.forget(
        Object.assign(new ForgetRunDto(), {
          id: opened.runId,
        }),
      ),
      false,
    );

    await door.close(
      Object.assign(new CloseRunDto(), {
        runId: opened.runId,
        endedAt: ASKED_AT + 3_000,
      }),
    );
    assert.equal(
      await door.forget(
        Object.assign(new ForgetRunDto(), {
          id: opened.runId,
        }),
      ),
      true,
    );

    assert.equal(await dataSource.getRepository(RunStepEntity).count(), 0);
    assert.equal(await dataSource.getRepository(RunCallEntity).count(), 0);
    assert.equal(await dataSource.getRepository(RunQuestionEntity).count(), 0);
    assert.equal(await dataSource.getRepository(RunQuestionAttachmentEntity).count(), 0);
  });

  it("keeps the files sent with each question whole and in the order they were glued in", async () => {
    // A repeat glues the question again from these, so nothing of them may come back changed.
    const opened = await door.open(
      opening({
        attached: [
          attachment(),
          attachment({
            path: "/tmp/coder-project/assets",
            name: "assets",
            kind: "folder",
            text: "=== assets/logo.png ===\niVBORw0KGgo=",
            binaries: ["logo.png"],
          }),
        ],
      }),
    );

    await door.close(
      Object.assign(new CloseRunDto(), {
        runId: opened.runId,
        endedAt: ASKED_AT + 3_000,
      }),
    );
    await door.askAgain(
      Object.assign(new AskAgainDto(), {
        runId: opened.runId,
        questionId: "99999999-9999-4999-8999-999999999999",
        asked: "А тепер це",
        askedAgentId: SEEKER,
        askedAgentName: "Шукач",
        attached: [
          attachment({
            path: "/tmp/coder-project/todo.md",
            name: "todo.md",
            text: "=== todo.md ===\n- тести",
          }),
        ],
        askedAt: ASKED_AT + 5_000,
      }),
    );

    const whole = await door.one(
      Object.assign(new ReadRunDto(), {
        id: opened.runId,
      }),
    );

    assert.deepEqual(
      whole?.questions.map((question) => question.attached),
      [
        [
          {
            path: "/tmp/coder-project/notes.md",
            name: "notes.md",
            kind: "file",
            text: "=== notes.md ===\n# Нотатки",
            binaries: [],
          },
          {
            path: "/tmp/coder-project/assets",
            name: "assets",
            kind: "folder",
            text: "=== assets/logo.png ===\niVBORw0KGgo=",
            binaries: ["logo.png"],
          },
        ],
        [
          {
            path: "/tmp/coder-project/todo.md",
            name: "todo.md",
            kind: "file",
            text: "=== todo.md ===\n- тести",
            binaries: [],
          },
        ],
      ],
    );
  });

  it("refuses a question whose attachment is of a kind it does not know, and writes nothing of it", async () => {
    await assert.rejects(
      door.open(
        opening({
          attached: [
            attachment({
              kind: "link",
            }),
          ],
        }),
      ),
    );

    assert.equal(await dataSource.getRepository(RunEntity).count(), 0);
  });

  it("refuses a question sent without its list of attachments, rather than taking it for none", async () => {
    await assert.rejects(
      door.open(
        opening({
          attached: undefined,
        }),
      ),
    );

    assert.equal(await dataSource.getRepository(RunEntity).count(), 0);
  });

  it("sweeps only the runs that ended, leaving a walk still going where it is", async () => {
    // «× ЗАБРАТИ N» counts only what has come back, not a run still writing.
    const ended = await door.open(opening());

    await door.close(
      Object.assign(new CloseRunDto(), {
        runId: ended.runId,
        endedAt: ASKED_AT + 3_000,
      }),
    );

    const going = await door.open(
      opening({
        questionId: "66666666-6666-4666-8666-666666666666",
      }),
    );
    const swept = await door.forgetAll(
      Object.assign(new ForgetRunsDto(), {
        directory: DIRECTORY,
      }),
    );
    const rows = await door.list(
      Object.assign(new ListRunsDto(), {
        directory: DIRECTORY,
      }),
    );

    assert.equal(swept, 1);
    assert.deepEqual(
      rows.map((row) => row.id),
      [going.runId],
    );
  });
});
