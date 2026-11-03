import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { openTestDatabase } from "../../../utils/testing";
import { RunKeeper } from "./run-keeper.service";
import { RunReader } from "./run-reader.service";
import { RunWriter } from "./run-writer.service";
import { TypeormRunStore, runTablesOf } from "../stores";
import { RunMemoryEntity, RunQuestionEntity } from "../entities";
import { HISTORY_DAYS, HISTORY_DAY_MS } from "../constants";
import type { AddCall, AddStep, MemoryFacts, OpenRun, RunOpened } from "../interfaces";
import type { TestDatabase } from "../../../utils/testing";

const DIRECTORY = "/tmp/coder-project";
const ASKED_AT = 1_700_000_000_000;
const SEEKER = "22222222-2222-4222-8222-222222222222";
const QUESTION = "44444444-4444-4444-8444-444444444444";
const WALK = "77777777-7777-4777-8777-777777777777";
/** A repeat is its own walk; the row is read by the last walk, not the last step. */
const REPEAT_WALK = "88888888-8888-4888-8888-888888888888";
const TELLER = "33333333-3333-4333-8333-333333333333";

/** The question each run was opened with. */
const questionOf = new Map<string, string>();

function ran(patch: Partial<AddCall> = {}): AddCall {
  return {
    // A call reaches the record under its existing id and keeps it.
    id: crypto.randomUUID(),
    source: "command",
    name: "find_deep",
    arguments: {
      depth: "2",
      mask: "*.md",
    },
    pinned: ["mask"],
    line: "find . -maxdepth 2 -type f -name '*.md'",
    output: "report.md",
    refusal: "",
    exitCode: 0,
    serverId: null,
    serverName: "",
    end: "ran",
    startedAt: 1_000,
    endedAt: 1_400,
    ...patch,
  };
}

function refused(): AddCall {
  return ran({
    arguments: {
      depth: "швидко",
    },
    line: "",
    output: "",
    refusal: "find_deep НЕ ЗАПУСТИЛАСЬ · depth — МАЄ БУТИ ЧИСЛОМ",
    exitCode: null,
    end: "refused",
  });
}

function step(runId: string, patch: Partial<AddStep> = {}): AddStep {
  return {
    runId,
    questionId: questionOf.get(runId) ?? QUESTION,
    walkId: WALK,
    agentId: SEEKER,
    agentName: "Шукач",
    agentColor: "#6fd3d8",
    modelId: "model-1",
    model: "deepseek/deepseek-v4-flash-0731",
    providerId: "openrouter",
    inputPrice: 3,
    outputPrice: 15,
    contextCeiling: 700_000,
    answerCeiling: 4096,
    promptId: "prompt-1",
    prompt: "Ти шукаєш файли.",
    temperature: 0,
    maxCalls: 8,
    memoryLength: 0,
    asked: "Знайди md-файли",
    said: "ЗНАЙДЕНО\n- report.md",
    state: "done",
    waitsFor: null,
    inputTokens: 2_263,
    outputTokens: 1_068,
    money: 0.0031,
    fromStepIds: [],
    handoffs: [],
    startedAt: 900,
    endedAt: 2_000,
    calls: [],
    memories: [],
    ...patch,
  };
}

describe("the record", () => {
  let record: TestDatabase;
  let writer: RunWriter;
  let reader: RunReader;
  let keeper: RunKeeper;

  /** Opens a run and keeps its question so its steps can be written against it. */
  async function openRun(payload: OpenRun): Promise<RunOpened> {
    const opened = await writer.open(payload);

    questionOf.set(opened.runId, opened.questionId);

    return opened;
  }

  beforeEach(async () => {
    questionOf.clear();

    // A fresh real database per test; the app's own is untouched.
    record = await openTestDatabase();

    const store = new TypeormRunStore(runTablesOf(record.dataSource));

    writer = new RunWriter(store);
    reader = new RunReader(store);
    keeper = new RunKeeper(store);
  });

  afterEach(async () => {
    await record.close();
  });

  it("names the row from the moment the question is written, before any step has landed", async () => {
    await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000001",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    const [row] = await reader.list(DIRECTORY);

    // The run keeps its own name, so a row with its first turn still out is not nameless.
    assert.equal(row.steps, 0);
    assert.equal(row.startedByAgentName, "Шукач");
    assert.equal(row.startedByAgentColor, "#6fd3d8");
    // The addressee is stored with the question, so the row's head is named before the first step.
    assert.equal(row.askedAgentId, SEEKER);
    assert.equal(row.askedAgentName, "Шукач");
  });

  it("names the row by whom the flow was asked last, and not by whom it was asked first", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000045",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.askAgain({
      runId: id,
      questionId: "aaaaaaaa-0000-4000-8000-000000000046",
      asked: "А тепер постав рев'ювера",
      askedAgentId: TELLER,
      askedAgentName: "Рев'юер",
      attached: [],
      askedAt: ASKED_AT + 1_000,
    });

    const [row] = await reader.list(DIRECTORY);

    // One flow, many agents: the head shows the current addressee, the run keeps the first.
    assert.equal(row.askedAgentId, TELLER);
    assert.equal(row.askedAgentName, "Рев'юер");
    assert.equal(row.startedByAgentId, SEEKER);
  });

  it("holds the addressee of every question, so an older one is not overwritten by a newer", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000047",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.askAgain({
      runId: id,
      questionId: "aaaaaaaa-0000-4000-8000-000000000048",
      asked: "А тепер постав рев'ювера",
      askedAgentId: TELLER,
      askedAgentName: "Рев'юер",
      attached: [],
      askedAt: ASKED_AT + 1_000,
    });

    const whole = await reader.one(id);
    const written = await record.dataSource.getRepository(RunQuestionEntity).find({
      order: {
        place: "ASC",
      },
    });

    // Each question keeps its own addressee.
    assert.equal(whole?.questions.length, 2);
    assert.deepEqual(
      written.map((question) => [question.place, question.askedAgentId, question.askedAgentName]),
      [
        [1, SEEKER, "Шукач"],
        [2, TELLER, "Рев'юер"],
      ],
    );
  });

  it("opens a run that stands running until something ends it", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000002",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.id, id);
    assert.equal(row.state, "running");
    assert.equal(row.endedAt, null);
    assert.equal(row.steps, 0);
  });

  it("keeps the steps in the order they ran, whatever order they were written in", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000003",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    const first = await writer.step(step(id));

    await writer.step(
      step(id, {
        agentId: TELLER,
        agentName: "Перелікар",
        fromStepIds: [first],
      }),
    );

    const whole = await reader.one(id);

    assert.deepEqual(
      whole?.walk.map((one) => [one.place, one.agentName]),
      [
        [1, "Шукач"],
        [2, "Перелікар"],
      ],
    );
    assert.deepEqual(whole?.walk[1].fromStepIds, [first]);
  });

  it("keeps the walk each step ran in, so a repeat can tell the last walk from the ones before it", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000004",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });
    const again = "88888888-8888-4888-8888-888888888888";

    await writer.step(step(id));
    await writer.step(
      step(id, {
        walkId: again,
        agentId: TELLER,
        agentName: "Перелікар",
      }),
    );

    const whole = await reader.one(id);

    assert.deepEqual(
      whole?.walk.map((one) => one.walkId),
      [WALK, again],
    );
  });

  it("keeps the agent as it stood when it ran, so renaming it later says nothing about the run", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000005",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(step(id));

    const whole = await reader.one(id);

    assert.equal(whole?.walk[0].agentName, "Шукач");
    assert.equal(whole?.walk[0].agentColor, "#6fd3d8");
    assert.equal(whole?.walk[0].model, "deepseek/deepseek-v4-flash-0731");
  });

  it("keeps a call whole: what it was given, the line that ran, what it printed and how it ended", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000006",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        calls: [ran()],
      }),
    );

    const [call] = (await reader.one(id))?.walk[0].calls ?? [];

    assert.equal(call.name, "find_deep");
    assert.deepEqual(call.arguments, {
      depth: "2",
      mask: "*.md",
    });
    assert.equal(call.line, "find . -maxdepth 2 -type f -name '*.md'");
    assert.equal(call.output, "report.md");
    assert.equal(call.exitCode, 0);
    assert.equal(call.end, "ran");
    // The record tells pinned values from the model's.
    assert.deepEqual(call.pinned, ["mask"]);
  });

  it("says where a call stands, by the very id the call already wore", async () => {
    // A call id alone resolves to its place.
    const opened = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-00000000000c",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });
    const call = ran();
    const stepId = await writer.step(
      step(opened.runId, {
        calls: [call],
      }),
    );

    assert.deepEqual(await reader.placeOfCall(call.id), {
      runId: opened.runId,
      questionId: opened.questionId,
      stepId,
    });
  });

  it("says nothing of a call the record does not hold, so nothing leads anywhere", async () => {
    assert.equal(await reader.placeOfCall("99999999-9999-4999-8999-999999999999"), null);
  });

  it("keeps a refused call with the words of the refusal and no code, since there was no process", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000007",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        calls: [refused(), ran()],
      }),
    );

    const calls = (await reader.one(id))?.walk[0].calls ?? [];

    assert.deepEqual(
      calls.map((call) => [call.place, call.end, call.exitCode]),
      [
        [1, "refused", null],
        [2, "ran", 0],
      ],
    );
    assert.equal(calls[0].refusal, "find_deep НЕ ЗАПУСТИЛАСЬ · depth — МАЄ БУТИ ЧИСЛОМ");
    assert.equal(calls[0].line, "");
  });

  it("says a run with no end is running, whatever its steps said", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000008",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        state: "failed",
      }),
    );

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.state, "running");
  });

  it("takes the state of the last walk, so an older walk's fall is not read again", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000009",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        state: "failed",
      }),
    );
    // A repeat is its own walk, and the row is read by it.
    await writer.step(
      step(id, {
        walkId: REPEAT_WALK,
        state: "stopped",
      }),
    );
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    // State is counted from the steps on every read.
    assert.equal(row.state, "stopped");
    assert.notEqual(row.endedAt, null);
    assert.equal(row.steps, 2);
  });

  it("says nothing was sent where the last turn never began, and never says it fell", async () => {
    // An unknown end word is not «done»: a provider that never answered is not «ГОТОВО», nor «УПАВ».
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000051",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        state: "unreachable",
      }),
    );
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.state, "notSent");
  });

  it("keeps a turn without consent by its own end and the server it waited on, and reads both back", async () => {
    const serverId = "99999999-9999-4999-8999-999999999999";
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000061",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        said: "exa-mcp ще не запускали на цій машині — його рядок запуску чекає вашої згоди.",
        state: "noConsent",
        waitsFor: serverId,
        inputTokens: 0,
        outputTokens: 0,
        money: 0,
      }),
    );
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const whole = await reader.one(id);
    const [row] = await reader.list(DIRECTORY);

    assert.equal(whole?.walk[0].state, "noConsent");
    assert.equal(whole?.walk[0].waitsFor, serverId);
    // Nothing was started and nothing sent: the row says so, not that it fell.
    assert.equal(row.state, "notSent");
  });

  it("says nothing was sent where the model answered with nothing, no answer having come of it", async () => {
    // An empty answer counts for the row like a turn that never left.
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000052",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        state: "silent",
      }),
    );
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.state, "notSent");
  });

  it("says nothing was sent of a flow closed without a single step, since nothing ever left", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000053",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.steps, 0);
    assert.equal(row.state, "notSent");
  });

  it("reads the whole last walk, so a branch that fell does not hide behind one that answered after it", async () => {
    // With two branches finishing in any order, a fallen branch is not shown as «ГОТОВО».
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000055",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        state: "failed",
      }),
    );
    await writer.step(step(id));
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.state, "failed");
  });

  it("takes the worse word where the branches ended differently, a fall being worse than nothing sent", async () => {
    // «УПАВ» outranks «НЕ ПІШОВ»: a sent turn that broke is worse than one that never left.
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000059",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        state: "unreachable",
      }),
    );
    await writer.step(
      step(id, {
        state: "failed",
      }),
    );
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.state, "failed");
  });

  it("says nothing was sent where every branch that did not answer never left", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000060",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(step(id));
    await writer.step(
      step(id, {
        state: "unreachable",
      }),
    );
    await writer.step(
      step(id, {
        state: "silent",
      }),
    );
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.state, "notSent");
  });

  it("calls a walk done only where every one of its turns answered", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000056",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(step(id));
    await writer.step(step(id));
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.state, "done");
  });

  it("says a hand where a hand stopped every turn that did not answer, and the other word where one did not", async () => {
    // A stop explains only what it stopped; another branch that never left still gives «НЕ ПІШОВ».
    const stopped = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000057",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Перше",
    });
    const notLeft = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000058",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Друге",
    });

    for (const runId of [stopped.runId, notLeft.runId]) {
      await writer.step(step(runId));
      await writer.step(
        step(runId, {
          state: "stopped",
        }),
      );
    }

    await writer.step(
      step(notLeft.runId, {
        state: "unreachable",
      }),
    );

    for (const runId of [stopped.runId, notLeft.runId]) {
      await writer.close({
        runId,
        endedAt: ASKED_AT + 4_000,
      });
    }

    const rows = await reader.list(DIRECTORY);

    assert.equal(rows.find((row) => row.id === stopped.runId)?.state, "stopped");
    assert.equal(rows.find((row) => row.id === notLeft.runId)?.state, "notSent");
  });

  it("calls a flow done where the walk that fell was mended by a later one", async () => {
    // A real answer is the only «ГОТОВО»; a mended fall in an earlier walk is not read again.
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000054",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        state: "failed",
      }),
    );
    await writer.step(
      step(id, {
        walkId: REPEAT_WALK,
      }),
    );
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.state, "done");
  });

  it("hands back this project's runs and nobody else's, newest first", async () => {
    const { runId: mine } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000010",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT - HISTORY_DAY_MS,
      asked: "Перший",
    });
    const { runId: later } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000011",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Другий",
    });

    await openRun({
      directory: "/tmp/somebody-else",
      questionId: "aaaaaaaa-0000-4000-8000-000000000100",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Чужий",
    });
    assert.deepEqual(
      (await reader.list(DIRECTORY)).map((row) => row.asked),
      ["Другий", "Перший"],
    );
    assert.equal(later.length > 0, true);
    assert.equal(mine.length > 0, true);
  });

  it("takes a deleted run's steps and calls with it, since there is no history over the history", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000012",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        calls: [ran()],
      }),
    );
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 4_000,
    });
    assert.equal(
      await keeper.forget({
        id,
      }),
      true,
    );

    assert.deepEqual(await reader.list(DIRECTORY), []);
    assert.equal(await reader.one(id), null);
  });

  it("refuses to delete a run still going: the record is being written, and half a record is nobody's", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000013",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(step(id));

    assert.equal(
      await keeper.forget({
        id,
      }),
      false,
    );
    assert.equal((await reader.list(DIRECTORY)).length, 1);
  });

  it("leaves a run still going where it is when the whole history is deleted by hand", async () => {
    const { runId: going } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000014",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Іде",
    });
    const { runId: ended } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000015",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Скінчився",
    });

    await writer.close({
      runId: ended,
      endedAt: ASKED_AT + 4_000,
    });

    assert.equal(await keeper.forgetEnded(DIRECTORY), 1);
    assert.deepEqual(
      (await reader.list(DIRECTORY)).map((row) => row.id),
      [going],
    );
  });

  it("forgets every run of a project at once when the project itself is forgotten", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000016",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(step(id));
    await openRun({
      directory: "/tmp/somebody-else",
      questionId: "aaaaaaaa-0000-4000-8000-000000000101",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Чужий",
    });
    await keeper.forgetProject(DIRECTORY);

    assert.deepEqual(await reader.list(DIRECTORY), []);
    assert.equal((await reader.list("/tmp/somebody-else")).length, 1);
  });

  it("goes on in the record a flow already has when it is asked again", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000017",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT - HISTORY_DAY_MS,
      asked: "Знайди md-файли",
    });

    await writer.step(step(id));
    await writer.close({
      runId: id,
      endedAt: ASKED_AT - HISTORY_DAY_MS + 4_000,
    });
    await writer.askAgain({
      runId: id,
      questionId: "aaaaaaaa-0000-4000-8000-000000000034",
      asked: "А тепер постав рев'ювера",
      askedAgentId: SEEKER,
      askedAgentName: "SEEKER",
      attached: [],
      askedAt: ASKED_AT,
    });

    const [row] = await reader.list(DIRECTORY);

    // One flow is one row: the text and hour are the new question's, the start day stays.
    assert.equal(row.id, id);
    assert.equal(row.asked, "А тепер постав рев'ювера");
    assert.equal(row.startedAt.getTime(), ASKED_AT - HISTORY_DAY_MS);
    assert.equal(row.askedAt.getTime(), ASKED_AT);
    assert.equal(row.endedAt, null);
    assert.equal(row.state, "running");
  });

  it("stands a flow asked again above one begun later, since the list follows the last word", async () => {
    const { runId: older } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000018",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT - HISTORY_DAY_MS,
      asked: "Давній",
    });

    await writer.close({
      runId: older,
      endedAt: ASKED_AT - HISTORY_DAY_MS + 4_000,
    });
    await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000019",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT - 9_000,
      asked: "Пізніший",
    });
    await writer.askAgain({
      runId: older,
      questionId: "aaaaaaaa-0000-4000-8000-000000000035",
      asked: "Давній, спитаний знову",
      askedAgentId: SEEKER,
      askedAgentName: "SEEKER",
      attached: [],
      askedAt: ASKED_AT,
    });

    assert.deepEqual(
      (await reader.list(DIRECTORY)).map((row) => row.asked),
      ["Давній, спитаний знову", "Пізніший"],
    );
  });

  it("adds up how long the agents worked over the whole flow, and not the wait between questions", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000020",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        startedAt: ASKED_AT,
        endedAt: ASKED_AT + 4_000,
      }),
    );
    await writer.step(
      step(id, {
        startedAt: ASKED_AT + 60_000,
        endedAt: ASKED_AT + 61_500,
      }),
    );

    const [row] = await reader.list(DIRECTORY);

    // The gap between two questions is not counted as work.
    assert.equal(row.worked, 5_500);
  });

  it("names no question when the record it was asked to go on in is gone", async () => {
    // No question id exists to write the walk against.
    assert.equal(
      await writer.askAgain({
        runId: "11111111-1111-4111-8111-111111111111",
        questionId: "aaaaaaaa-0000-4000-8000-000000000036",
        asked: "У порожнечу",
        askedAgentId: SEEKER,
        askedAgentName: "SEEKER",
        attached: [],
        askedAt: ASKED_AT,
      }),
      null,
    );
  });

  it("counts the thirty days from the flow's last word, so one asked again yesterday stands", async () => {
    const now = new Date(ASKED_AT);
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000021",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT - (HISTORY_DAYS + 1) * HISTORY_DAY_MS,
      asked: "Давній, але живий",
    });

    await writer.askAgain({
      runId: id,
      questionId: "aaaaaaaa-0000-4000-8000-000000000037",
      asked: "Давній, але живий",
      askedAgentId: SEEKER,
      askedAgentName: "SEEKER",
      attached: [],
      askedAt: ASKED_AT - HISTORY_DAY_MS,
    });

    assert.equal(await keeper.sweep(now), 0);
    assert.equal((await reader.list(DIRECTORY)).length, 1);
  });

  it("keeps who ran each step in a row of its own, one per step and none shared", async () => {
    const { runId, questionId } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000022",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(runId, {
        questionId,
      }),
    );
    await writer.step(
      step(runId, {
        questionId,
        agentName: "Шукач-2",
        model: "hy-mt2",
      }),
    );

    const whole = await reader.one(runId);

    // Two turns are two snapshots; differing words make two rows, not a conflict.
    assert.deepEqual(
      whole?.walk.map((one) => [one.agentName, one.model]),
      [
        ["Шукач", "deepseek/deepseek-v4-flash-0731"],
        ["Шукач-2", "hy-mt2"],
      ],
    );
    // A step's money is stored with the prices it was counted from, since the catalogue is editable.
    assert.equal(whole?.walk[0].inputPrice, 3);
    assert.equal(whole?.walk[0].outputPrice, 15);
    assert.equal(whole?.walk[0].prompt, "Ти шукаєш файли.");
    // The snapshot keeps the model id, so «today» can be found.
    assert.equal(whole?.walk[0].modelId, "model-1");
    assert.equal(whole?.walk[0].promptId, "prompt-1");
    // The history row shows the name the walk began under.
    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.startedByAgentName, "Шукач");
  });

  it("keeps every question of a flow, and names the row by the last of them", async () => {
    const { runId, questionId } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000023",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT - HISTORY_DAY_MS,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(runId, {
        questionId,
      }),
    );
    await writer.close({
      runId,
      endedAt: ASKED_AT - HISTORY_DAY_MS + 4_000,
    });

    const second = await writer.askAgain({
      runId,
      questionId: "aaaaaaaa-0000-4000-8000-000000000102",
      asked: "А тепер постав рев'ювера",
      askedAgentId: SEEKER,
      askedAgentName: "SEEKER",
      attached: [],
      askedAt: ASKED_AT,
    });

    assert.notEqual(second, null);
    assert.notEqual(second, questionId);

    const [row] = await reader.list(DIRECTORY);

    // The history row is the last question of the flow.
    assert.equal(row.asked, "А тепер постав рев'ювера");
    assert.equal(row.askedAt.getTime(), ASKED_AT);
    assert.equal(row.startedAt.getTime(), ASKED_AT - HISTORY_DAY_MS);

    const whole = await reader.one(runId);

    assert.equal(whole?.walk[0].questionId, questionId);
  });

  it("keeps a question's hour to the millisecond, since the repeat finds its question by that very number", async () => {
    // Questions are told apart by exact hour, which «СПИТАТИ ЩЕ РАЗ» uses to look one up; no rounding to seconds.
    const first = ASKED_AT + 137;
    const second = ASKED_AT + 892;
    const { runId } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000024",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: first,
      asked: "Знайди md-файли",
    });

    await writer.askAgain({
      runId,
      questionId: "aaaaaaaa-0000-4000-8000-000000000103",
      asked: "А тепер постав рев'ювера",
      askedAgentId: SEEKER,
      askedAgentName: "SEEKER",
      attached: [],
      askedAt: second,
    });

    const whole = await reader.one(runId);
    const hours = (whole?.questions ?? []).map((question) => question.askedAt.getTime());

    assert.deepEqual(hours, [first, second]);
  });

  it("keeps the two edges of a walk as rows, and hands them back in the order they were named", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000025",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });
    const first = await writer.step(step(id));
    const second = await writer.step(
      step(id, {
        agentId: TELLER,
        fromStepIds: [first],
        handoffs: [
          {
            toAgentId: SEEKER,
            stopReason: null,
            text: "Знайдено три файли",
          },
          {
            toAgentId: TELLER,
            stopReason: "busy",
            text: "Знайдено три файли",
          },
        ],
      }),
    );

    const whole = await reader.one(id);
    const read = whole?.walk.find((one) => one.id === second);

    // A step's naming of other steps is a row of its own, so it can be followed, cleared with the step and queried.
    assert.deepEqual(read?.fromStepIds, [first]);
    assert.deepEqual(read?.handoffs, [
      {
        toAgentId: SEEKER,
        stopReason: null,
        text: "Знайдено три файли",
      },
      {
        toAgentId: TELLER,
        stopReason: "busy",
        text: "Знайдено три файли",
      },
    ]);
  });

  it("keeps why a line was not taken when the agent chose another way, and reads the words back as they were written", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000026",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });
    const only = await writer.step(
      step(id, {
        handoffs: [
          {
            toAgentId: SEEKER,
            stopReason: "notChosen",
            text: "",
          },
          {
            toAgentId: TELLER,
            stopReason: "finished",
            text: "",
          },
        ],
      }),
    );

    assert.deepEqual((await reader.one(id))?.walk.find((one) => one.id === only)?.handoffs, [
      {
        toAgentId: SEEKER,
        stopReason: "notChosen",
        text: "",
      },
      {
        toAgentId: TELLER,
        stopReason: "finished",
        text: "",
      },
    ]);
  });

  it("closes a run the app was shut on, at the last thing that actually happened", async () => {
    const { runId: walked } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000026",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });
    const { runId: mute } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000027",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Не дійшло до кроку",
    });

    await writer.step(
      step(walked, {
        startedAt: ASKED_AT,
        endedAt: ASKED_AT + 4_000,
      }),
    );

    assert.equal(await keeper.settleOpen(), 2);

    const rows = await reader.list(DIRECTORY);
    const one = rows.find((row) => row.id === walked);
    const other = rows.find((row) => row.id === mute);

    // A walk cannot outlive its window: nothing is «іде» after a restart.
    assert.equal(one?.endedAt?.getTime(), ASKED_AT + 4_000);
    assert.equal(other?.endedAt?.getTime(), ASKED_AT);
    assert.equal(one?.state, "done");
  });

  it("sweeps out what is older than thirty days and leaves the thirtieth day standing", async () => {
    const now = new Date(ASKED_AT);

    await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000028",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT - (HISTORY_DAYS + 1) * HISTORY_DAY_MS,
      asked: "Давній",
    });
    await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000029",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT - HISTORY_DAY_MS,
      asked: "Вчорашній",
    });

    assert.equal(await keeper.sweep(now), 1);
    assert.deepEqual(
      (await reader.list(DIRECTORY)).map((row) => row.asked),
      ["Вчорашній"],
    );
  });

  it("keeps the times it was given: a run begins with the question and ends with the walk", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000030",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(step(id));
    await writer.close({
      runId: id,
      endedAt: ASKED_AT + 9_000,
    });

    const [row] = await reader.list(DIRECTORY);

    // Not the first step's landing time, nor the last write's.
    assert.equal(row.startedAt.getTime(), ASKED_AT);
    assert.equal(row.endedAt?.getTime(), ASKED_AT + 9_000);
  });

  it("adds up what the steps cost, and names the agent it started from as it stood then", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000031",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(step(id));
    await writer.step(
      step(id, {
        agentId: TELLER,
        agentName: "Перелікар",
        agentColor: "#e8c46a",
        money: 0.002,
      }),
    );

    const [row] = await reader.list(DIRECTORY);

    assert.equal(Math.round((row.money ?? 0) * 10_000) / 10_000, 0.0051);
    assert.equal(row.startedByAgentName, "Шукач");
    assert.equal(row.startedByAgentColor, "#6fd3d8");
  });

  it("hands a step back with the numbers it never carried still missing, not as zeros", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000032",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        inputPrice: null,
        outputPrice: null,
        contextCeiling: null,
        answerCeiling: null,
        money: null,
      }),
    );

    const [whole] = (await reader.one(id))?.walk ?? [];

    assert.equal(whole?.inputPrice, null);
    assert.equal(whole?.contextCeiling, null);
    assert.equal(whole?.answerCeiling, null);
    assert.equal(whole?.money, null);
  });

  it("names no money for a run whose steps carried none, rather than a bill of nothing", async () => {
    const { runId: id } = await openRun({
      directory: DIRECTORY,
      questionId: "aaaaaaaa-0000-4000-8000-000000000033",
      startedByAgentId: SEEKER,
      startedByAgentName: "Шукач",
      startedByAgentColor: "#6fd3d8",
      attached: [],
      startedAt: ASKED_AT,
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        money: null,
      }),
    );

    const [row] = await reader.list(DIRECTORY);

    assert.equal(row.money, null);
  });

  describe("the shared memory of a question", () => {
    const NOTES = {
      path: "/tmp/coder-project/notes.md",
      name: "notes.md",
      kind: "file" as const,
      text: "=== notes.md ===\n# Нотатки",
      binaries: [],
    };

    async function opened(questionId: string): Promise<RunOpened> {
      return openRun({
        directory: DIRECTORY,
        questionId,
        startedByAgentId: SEEKER,
        startedByAgentName: "Шукач",
        startedByAgentColor: "#6fd3d8",
        attached: [NOTES],
        startedAt: ASKED_AT,
        asked: "Знайди md-файли",
      });
    }

    it("gives the question with its files glued in, then every answer with whom its work came from", async () => {
      const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000201");
      const found = await writer.step(step(runId));

      await writer.step(
        step(runId, {
          agentId: TELLER,
          agentName: "Рев'юер",
          asked: "ЗНАЙДЕНО\n- report.md",
          said: "Перевірено",
          fromStepIds: [found],
        }),
      );

      assert.equal(
        (await reader.sharedMemory(runId, questionId, SEEKER))?.text ?? null,
        [
          "ЗАГАЛЬНА ПАМ'ЯТЬ — що вже сталося з цим питанням до тебе: хто кому що передав.",
          "ПИТАННЯ ЛЮДИНИ → Шукач:\nЗнайди md-файли\n\n=== notes.md ===\n# Нотатки",
          "ВІДПОВІДЬ Шукач (отримав від: ЛЮДИНА):\nЗНАЙДЕНО\n- report.md",
          "ВІДПОВІДЬ Рев'юер (отримав від: Шукач):\nПеревірено",
        ].join("\n\n"),
      );
    });

    it("leaves out a turn that did not answer, and every other question of the flow", async () => {
      const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000202");

      await writer.step(
        step(runId, {
          said: "Модель не відповіла",
          state: "failed",
        }),
      );
      await writer.step(
        step(runId, {
          said: "Зупинено на півслові",
          state: "stopped",
        }),
      );
      await writer.step(step(runId));
      await writer.close({
        runId,
        endedAt: ASKED_AT + 4_000,
      });

      const next = await writer.askAgain({
        runId,
        questionId: "aaaaaaaa-0000-4000-8000-000000000203",
        asked: "А тепер інше",
        askedAgentId: SEEKER,
        askedAgentName: "Шукач",
        attached: [],
        askedAt: ASKED_AT + 5_000,
      });

      await writer.step(
        step(runId, {
          questionId: next ?? "",
          said: "Інша відповідь",
        }),
      );

      const memory = (await reader.sharedMemory(runId, questionId, SEEKER))?.text ?? "";

      assert.ok(memory.includes("ЗНАЙДЕНО\n- report.md"));
      assert.ok(!memory.includes("Модель не відповіла"));
      assert.ok(!memory.includes("Зупинено на півслові"));
      assert.ok(!memory.includes("А тепер інше"));
      assert.ok(!memory.includes("Інша відповідь"));
    });

    it("is empty while nothing of the question has answered, the question being the turn's own words then", async () => {
      const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000204");

      await writer.step(
        step(runId, {
          state: "failed",
        }),
      );

      assert.equal((await reader.sharedMemory(runId, questionId, SEEKER))?.text ?? null, "");
    });

    it("names a supplier from an earlier question by whom it was then", async () => {
      const { runId } = await opened("aaaaaaaa-0000-4000-8000-000000000216");
      const found = await writer.step(step(runId));
      const again = "aaaaaaaa-0000-4000-8000-000000000217";

      await writer.askAgain({
        runId,
        questionId: again,
        asked: "Перевір знайдене",
        askedAgentId: TELLER,
        askedAgentName: "Рев'юер",
        attached: [],
        askedAt: ASKED_AT + 1_000,
      });
      await writer.step(
        step(runId, {
          questionId: again,
          agentId: TELLER,
          agentName: "Рев'юер",
          said: "Перевірено",
          fromStepIds: [found],
        }),
      );

      const told = (await reader.sharedMemory(runId, again, TELLER))?.text ?? "";

      assert.ok(told.includes("ВІДПОВІДЬ Рев'юер (отримав від: Шукач):\nПеревірено"));
      assert.ok(!told.includes("ЗНАЙДЕНО"));
    });

    describe("compressed by the composer", () => {
      /** What the composer wrote for the Seeker's memory of the question, covering the first answer. */
      function composed(patch: Partial<MemoryFacts> = {}): MemoryFacts {
        return {
          agentId: SEEKER,
          questionId: null,
          coversPlace: 1,
          text: "Знайдено report.md",
          lengthBefore: 900,
          lengthAfter: 18,
          compressAt: 80,
          compressTo: 20,
          inputTokens: 500,
          outputTokens: 20,
          money: 0.0004,
          ...patch,
        };
      }

      it("tells the composer's message in place of the question and the answers it covers, then the answers after it", async () => {
        const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000206");
        const found = await writer.step(step(runId));

        await writer.step(
          step(runId, {
            agentId: TELLER,
            agentName: "Рев'юер",
            asked: "ЗНАЙДЕНО\n- report.md",
            said: "Перевірено",
            fromStepIds: [found],
          }),
        );
        await writer.step(
          step(runId, {
            asked: "Ще раз",
            said: "ЗНАЙДЕНО\n- other.md",
            memories: [
              composed({
                questionId,
              }),
            ],
          }),
        );

        assert.equal(
          (await reader.sharedMemory(runId, questionId, SEEKER))?.text ?? null,
          [
            "ЗАГАЛЬНА ПАМ'ЯТЬ — що вже сталося з цим питанням до тебе: хто кому що передав.",
            "ПОПЕРЕДНЄ, СТИСЛО (питання людини і відповіді до цього моменту):\nЗнайдено report.md",
            "ВІДПОВІДЬ Рев'юер (отримав від: Шукач):\nПеревірено",
            "ВІДПОВІДЬ Шукач (отримав від: ЛЮДИНА):\nЗНАЙДЕНО\n- other.md",
          ].join("\n\n"),
        );
      });

      it("leaves another agent's shared memory of the same question as it stood, whole", async () => {
        const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000207");

        await writer.step(step(runId));
        await writer.step(
          step(runId, {
            memories: [
              composed({
                questionId,
              }),
            ],
          }),
        );

        const told = (await reader.sharedMemory(runId, questionId, TELLER))?.text ?? "";

        assert.ok(told.includes("ПИТАННЯ ЛЮДИНИ → Шукач:"));
        assert.ok(!told.includes("ПОПЕРЕДНЄ, СТИСЛО"));
      });

      it("stands in for nothing the composer was not given: the answers after the covered place stay, however many", async () => {
        const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000208");

        await writer.step(step(runId));
        await writer.step(
          step(runId, {
            said: "Друга",
            memories: [
              composed({
                questionId,
                coversPlace: 1,
              }),
            ],
          }),
        );
        await writer.step(
          step(runId, {
            said: "Третя",
            memories: [
              composed({
                questionId,
                coversPlace: 2,
                text: "Знайдено report.md і Друга",
              }),
            ],
          }),
        );

        const told = (await reader.sharedMemory(runId, questionId, SEEKER))?.text ?? "";

        // The later compression stands, and it covers the second answer too.
        assert.ok(told.includes("Знайдено report.md і Друга"));
        assert.ok(!told.includes("Знайдено report.md\n"));
        assert.ok(!told.includes("ВІДПОВІДЬ Шукач (отримав від: ЛЮДИНА):\nДруга"));
        assert.ok(told.includes("ВІДПОВІДЬ Шукач (отримав від: ЛЮДИНА):\nТретя"));
      });

      it("hands the compressions back with the run, each with the step that paid for it and its place", async () => {
        const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000209");

        await writer.step(step(runId));
        const paid = await writer.step(
          step(runId, {
            memories: [
              composed({
                questionId,
              }),
            ],
          }),
        );
        const whole = await reader.one(runId);

        assert.equal(whole?.memories.length, 1);
        assert.equal(whole?.memories[0].stepId, paid);
        assert.equal(whole?.memories[0].stepPlace, 2);
        assert.equal(whole?.memories[0].coversPlace, 1);
        assert.equal(whole?.memories[0].text, "Знайдено report.md");
        assert.equal(whole?.memories[0].lengthBefore, 900);
        assert.equal(whole?.memories[0].lengthAfter, 18);
        // The agent's settings then, kept as a fact of the step.
        assert.equal(whole?.memories[0].compressAt, 80);
        assert.equal(whole?.memories[0].compressTo, 20);
        assert.equal(whole?.memories[0].money, 0.0004);
      });

      it("tells a compression the record is yet to be told of in the place of the question and the answers it covers, then the answers after it", async () => {
        const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000214");
        const found = await writer.step(step(runId));

        await writer.step(
          step(runId, {
            agentId: TELLER,
            agentName: "Рев'юер",
            asked: "ЗНАЙДЕНО\n- report.md",
            said: "Перевірено",
            fromStepIds: [found],
          }),
        );

        const told = await reader.sharedMemory(runId, questionId, SEEKER, {
          text: "Ще не записане стиснення",
          coversPlace: 1,
        });

        assert.ok(
          told?.text.includes(
            "ПОПЕРЕДНЄ, СТИСЛО (питання людини і відповіді до цього моменту):\nЩе не записане стиснення",
          ),
        );
        assert.ok(!told?.text.includes("ПИТАННЯ ЛЮДИНИ → Шукач:"));
        assert.ok(told?.text.includes("ВІДПОВІДЬ Рев'юер"));
        assert.equal(told?.coversPlace, 2);
      });

      it("leaves the written compression standing where it reaches further than one the record is yet to be told of", async () => {
        const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000215");

        await writer.step(step(runId));
        await writer.step(
          step(runId, {
            said: "Друга",
          }),
        );
        await writer.step(
          step(runId, {
            said: "Третя",
            memories: [
              composed({
                questionId,
                coversPlace: 2,
                text: "Записане стиснення",
              }),
            ],
          }),
        );

        const told = (
          await reader.sharedMemory(runId, questionId, SEEKER, {
            text: "Коротше стиснення",
            coversPlace: 1,
          })
        )?.text;

        assert.ok(told?.includes("Записане стиснення"));
        assert.ok(!told?.includes("Коротше стиснення"));
      });

      it("keeps an agent's own thread's compression apart, with no question", async () => {
        const { runId } = await opened("aaaaaaaa-0000-4000-8000-000000000210");

        await writer.step(step(runId));
        await writer.step(
          step(runId, {
            memories: [composed()],
          }),
        );

        const whole = await reader.one(runId);

        assert.equal(whole?.memories[0].questionId, null);
        assert.equal(whole?.memories[0].agentId, SEEKER);
      });

      it("keeps both compressions a step paid for: its own memory's and a tool's", async () => {
        const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000213");

        await writer.step(step(runId));

        const paid = await writer.step(
          step(runId, {
            memories: [
              composed({
                questionId,
              }),
              composed({
                agentId: TELLER,
                questionId,
                text: "Рев'юер уже бачив report.md",
              }),
            ],
          }),
        );
        const whole = await reader.one(runId);

        assert.equal(whole?.memories.length, 2);
        assert.deepEqual(
          whole?.memories.map((one) => one.stepId),
          [paid, paid],
        );
        assert.deepEqual(whole?.memories.map((one) => one.agentId).sort(), [SEEKER, TELLER].sort());
      });

      it("writes none for a step that compressed nothing", async () => {
        const { runId } = await opened("aaaaaaaa-0000-4000-8000-000000000211");

        await writer.step(step(runId));

        assert.deepEqual((await reader.one(runId))?.memories, []);
      });

      it("goes with the run when it is forgotten", async () => {
        const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000212");

        await writer.step(
          step(runId, {
            memories: [
              composed({
                questionId,
              }),
            ],
          }),
        );
        await writer.close({
          runId,
          endedAt: ASKED_AT + 4_000,
        });
        await keeper.forget({
          id: runId,
        });

        assert.equal(await record.dataSource.getRepository(RunMemoryEntity).count(), 0);
      });
    });

    it("names no memory for a run or a question the record does not hold, rather than an empty one", async () => {
      const { runId } = await opened("aaaaaaaa-0000-4000-8000-000000000205");

      assert.equal(await reader.sharedMemory(runId, "aaaaaaaa-0000-4000-8000-000000000299", SEEKER), null);
      assert.equal(
        await reader.sharedMemory(
          "aaaaaaaa-0000-4000-8000-000000000298",
          "aaaaaaaa-0000-4000-8000-000000000205",
          SEEKER,
        ),
        null,
      );
    });
  });

  describe("an agent's own thread", () => {
    /** A compression of the Seeker's own thread, covering up to `coversPlace`. */
    function own(coversPlace: number, text: string, patch: Partial<MemoryFacts> = {}): MemoryFacts {
      return {
        agentId: SEEKER,
        questionId: null,
        coversPlace,
        text,
        lengthBefore: 900,
        lengthAfter: text.length,
        compressAt: 80,
        compressTo: 20,
        inputTokens: 500,
        outputTokens: 20,
        money: 0.0004,
        ...patch,
      };
    }

    async function opened(questionId: string): Promise<RunOpened> {
      return openRun({
        directory: DIRECTORY,
        questionId,
        startedByAgentId: SEEKER,
        startedByAgentName: "Шукач",
        startedByAgentColor: "#6fd3d8",
        attached: [],
        startedAt: ASKED_AT,
        asked: "Знайди md-файли",
      });
    }

    it("reads the latest compression of the thread and only the agent's steps after the place it covers", async () => {
      const { runId, questionId } = await opened("aaaaaaaa-0000-4000-8000-000000000301");

      await writer.step(
        step(runId, {
          said: "Перша",
        }),
      );
      await writer.step(
        step(runId, {
          agentId: TELLER,
          agentName: "Рев'юер",
          said: "Чужа",
        }),
      );
      await writer.step(
        step(runId, {
          said: "Друга",
          memories: [own(1, "Стиснення до першої")],
        }),
      );
      await writer.step(
        step(runId, {
          said: "Третя",
          // The shared memory of the question is another memory, and does not stand for the thread.
          memories: [
            own(3, "Стиснення до другої"),
            own(4, "Спільна пам'ять питання", {
              questionId,
            }),
          ],
        }),
      );
      await writer.step(
        step(runId, {
          said: "",
          state: "failed",
        }),
      );
      await writer.step(
        step(runId, {
          agentId: TELLER,
          agentName: "Рев'юер",
          said: "Ще чужа",
        }),
      );

      const thread = await reader.ownThread(runId, SEEKER);

      assert.equal(thread?.composed?.text, "Стиснення до другої");
      assert.equal(thread?.composed?.coversPlace, 3);
      // Every step of the agent after the covered place, however it ended; the thread itself keeps only the answered.
      assert.deepEqual(
        thread?.steps.map((one) => [one.place, one.agentId, one.state, one.said]),
        [
          [4, SEEKER, "done", "Третя"],
          [5, SEEKER, "failed", ""],
        ],
      );
    });

    it("reads every step of the agent while its thread was never compressed", async () => {
      const { runId } = await opened("aaaaaaaa-0000-4000-8000-000000000302");

      await writer.step(
        step(runId, {
          said: "Перша",
        }),
      );
      await writer.step(
        step(runId, {
          agentId: TELLER,
          agentName: "Рев'юер",
          said: "Чужа",
        }),
      );
      await writer.step(
        step(runId, {
          asked: "Ще раз",
          said: "Друга",
        }),
      );

      const thread = await reader.ownThread(runId, SEEKER);

      assert.equal(thread?.composed, null);
      assert.deepEqual(
        thread?.steps.map((one) => [one.place, one.asked, one.said]),
        [
          [1, "Знайди md-файли", "Перша"],
          [3, "Ще раз", "Друга"],
        ],
      );
    });

    it("names no thread for a run the record does not hold, rather than an empty one", async () => {
      assert.equal(await reader.ownThread("aaaaaaaa-0000-4000-8000-000000000399", SEEKER), null);
    });
  });
});
