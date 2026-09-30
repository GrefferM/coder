import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { openTestDatabase } from "../../../utils/testing";
import { RunSearch } from "./run-search.service";
import { RunWriter } from "./run-writer.service";
import { TypeormRunStore, runTablesOf } from "../stores";
import { RUN_FOUND_LENGTH } from "../constants";
import { RUN_HITS_LIMIT } from "../../../contracts";
import type { AddStepDto, OpenRunDto } from "../dto";
import type { TestDatabase } from "../../../utils/testing";

const DIRECTORY = "/tmp/coder-project";
const ELSEWHERE = "/tmp/somebody-else";
const ASKED_AT = 1_700_000_000_000;
const SEEKER = "22222222-2222-4222-8222-222222222222";
const WALK = "77777777-7777-4777-8777-777777777777";

/** The question each run stands on. */
const questionOf = new Map<string, string>();
let minted = 0;

function anId(): string {
  minted += 1;

  return `aaaaaaaa-0000-4000-8000-${String(minted).padStart(12, "0")}`;
}

function opening(patch: Partial<OpenRunDto> = {}): OpenRunDto {
  return {
    directory: DIRECTORY,
    questionId: anId(),
    startedByAgentId: SEEKER,
    startedByAgentName: "Шукач",
    startedByAgentColor: "#6fd3d8",
    startedAt: ASKED_AT,
    asked: "Знайди md-файли",
    ...patch,
  };
}

function step(runId: string, patch: Partial<AddStepDto> = {}): AddStepDto {
  return {
    runId,
    questionId: questionOf.get(runId) ?? "",
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
    asked: "Знайди md-файли",
    said: "Нічого не знайшов.",
    state: "done",
    inputTokens: 2_263,
    outputTokens: 1_068,
    money: 0.0031,
    fromStepIds: [],
    handoffs: [],
    startedAt: 900,
    endedAt: 2_000,
    calls: [],
    ...patch,
  };
}

describe("the search over the record", () => {
  let record: TestDatabase;
  let writer: RunWriter;
  let search: RunSearch;

  /** Opens a run and keeps its question so steps can be written against it. */
  async function openRun(patch: Partial<OpenRunDto> = {}): Promise<string> {
    const payload = opening(patch);
    const opened = await writer.open(payload);

    questionOf.set(opened.runId, opened.questionId);

    return opened.runId;
  }

  beforeEach(async () => {
    questionOf.clear();
    minted = 0;
    record = await openTestDatabase();

    const store = new TypeormRunStore(runTablesOf(record.dataSource));

    writer = new RunWriter(store);
    search = new RunSearch(store);
  });

  afterEach(async () => {
    await record.close();
  });

  it("finds the word in the text of a question, and names that question and no step", async () => {
    const id = await openRun({
      asked: "Розбий текст на тези",
    });

    const [hit] = await search.find(DIRECTORY, "тези");

    assert.equal(hit.runId, id);
    assert.equal(hit.questionId, questionOf.get(id));
    // A hit in the question has no step.
    assert.equal(hit.stepId, null);
    assert.equal(hit.isCall, false);
  });

  it("finds the word in what a step said, and names the step a press should land on", async () => {
    const id = await openRun();
    const stepId = await writer.step(
      step(id, {
        said: "ЗНАЙДЕНО\n- report.md",
      }),
    );

    const [hit] = await search.find(DIRECTORY, "report");

    assert.equal(hit.stepId, stepId);
    assert.equal(hit.isCall, false);
  });

  it("finds the word in a call's command and in its output, and marks the hit as a call's", async () => {
    const id = await openRun();
    const stepId = await writer.step(
      step(id, {
        calls: [
          {
            id: crypto.randomUUID(),
            source: "command",
            name: "find_deep",
            arguments: {},
            pinned: [],
            line: "find . -maxdepth 2 -name '*.md'",
            output: "нотатки.md",
            refusal: "",
            exitCode: 0,
            serverId: null,
            serverName: "",
            end: "ran",
            startedAt: 1_000,
            endedAt: 1_400,
          },
        ],
      }),
    );

    const [byLine] = await search.find(DIRECTORY, "maxdepth");
    const [byOutput] = await search.find(DIRECTORY, "нотатки");

    assert.equal(byLine.stepId, stepId);
    assert.equal(byLine.isCall, true);
    assert.equal(byOutput.stepId, stepId);
    assert.equal(byOutput.isCall, true);
  });

  it("hands the found words back from the start of their own sentence, and not from the start of the text", async () => {
    const id = await openRun();

    await writer.step(
      step(id, {
        said: "Перше речення. Друге речення зі словом ялина. Третє речення.",
      }),
    );

    const [hit] = await search.find(DIRECTORY, "ялина");

    // The found thing starts at its sentence's start and runs on; the right edge is the card's.
    assert.equal(hit.found, "Друге речення зі словом ялина. Третє речення.");
  });

  it("takes a call's words from the start of their line, calls having no sentences", async () => {
    const id = await openRun();

    await writer.step(
      step(id, {
        calls: [
          {
            id: crypto.randomUUID(),
            source: "command",
            name: "grep",
            arguments: {},
            pinned: [],
            line: "grep -rn ялина .",
            output: "перший рядок\nдругий рядок зі словом ялина\nтретій рядок",
            refusal: "",
            exitCode: 0,
            serverId: null,
            serverName: "",
            end: "ran",
            startedAt: 1_000,
            endedAt: 1_400,
          },
        ],
      }),
    );

    const [hit] = await search.find(DIRECTORY, "другий");

    assert.equal(hit.found, "другий рядок зі словом ялина\nтретій рядок");
  });

  it("cuts the found words to a length two lines cannot outrun, so no whole output crosses the boundary", async () => {
    const id = await openRun();

    await writer.step(
      step(id, {
        said: `Ялина ${"а".repeat(RUN_FOUND_LENGTH * 3)}`,
      }),
    );

    const [hit] = await search.find(DIRECTORY, "ялина");

    assert.equal(hit.found.length, RUN_FOUND_LENGTH);
  });

  it("hands every place the word stands in back, in the order the walk ran", async () => {
    const id = await openRun({
      asked: "Розбий текст на тези",
    });

    await writer.step(
      step(id, {
        said: "Перша відповідь про тези.",
      }),
    );
    await writer.step(
      step(id, {
        said: "Друга відповідь про тези.",
      }),
    );

    const found = await search.find(DIRECTORY, "тези");

    // Question first, then every step that says the word: three hits.
    assert.equal(found.length, 3);
    assert.equal(found[0].stepId, null);
    assert.notEqual(found[1].stepId, null);
    assert.notEqual(found[2].stepId, null);
    assert.notEqual(found[1].stepId, found[2].stepId);
  });

  it("cuts the answer where a short word stands in more places than anyone will read", async () => {
    const id = await openRun({
      asked: "Знайди md-файли",
    });

    for (let stood = 0; stood < RUN_HITS_LIMIT + 5; stood += 1) {
      await writer.step(
        step(id, {
          said: "ялина",
        }),
      );
    }

    assert.equal((await search.find(DIRECTORY, "ялина")).length, RUN_HITS_LIMIT);
  });

  it("catches the word inside a word, and cares nothing for the case it was typed in", async () => {
    const id = await openRun({
      asked: "Перевір сесії користувачів",
    });

    assert.equal((await search.find(DIRECTORY, "сесі"))[0]?.runId, id);
    assert.equal((await search.find(DIRECTORY, "СЕСІЇ"))[0]?.runId, id);
  });

  it("finds nothing on an empty field, an empty field being no search at all", async () => {
    await openRun({
      asked: "Розбий текст на тези",
    });

    assert.deepEqual(await search.find(DIRECTORY, ""), []);
    assert.deepEqual(await search.find(DIRECTORY, "   "), []);
  });

  it("looks only in this project's record and in nobody else's", async () => {
    await openRun({
      directory: ELSEWHERE,
      asked: "Чужа ялина",
    });

    assert.deepEqual(await search.find(DIRECTORY, "ялина"), []);
    assert.equal((await search.find(ELSEWHERE, "ялина")).length, 1);
  });

  it("names whose message a found place is, and the hour and the step of the walk it stood on", async () => {
    const id = await openRun();

    await writer.step(
      step(id, {
        agentId: "33333333-3333-4333-8333-333333333333",
        agentName: "Тестер",
        said: "Знайшов ялину.",
        startedAt: 1_500,
        endedAt: 2_600,
      }),
    );

    const [hit] = await search.find(DIRECTORY, "ялин");

    // A hit is the address of one message: whose, which step, what hour.
    assert.equal(hit.agentId, "33333333-3333-4333-8333-333333333333");
    assert.equal(hit.agentName, "Тестер");
    assert.equal(hit.step, 1);
    // The hour is the turn's start, not its end.
    assert.equal(hit.at?.getTime(), 1_500);
  });

  it("counts the step of a place off the steps that fed it, a converging turn taking the deepest and one more", async () => {
    const id = await openRun();
    const first = await writer.step(
      step(id, {
        said: "Ялина перша.",
      }),
    );
    const second = await writer.step(
      step(id, {
        said: "Ялина друга.",
      }),
    );

    await writer.step(
      step(id, {
        said: "Ялина третя.",
        fromStepIds: [first, second],
      }),
    );

    const steps = (await search.find(DIRECTORY, "ялина")).map((hit) => hit.step);

    // Two unfed turns are level 1; the turn fed by both is level 2.
    assert.deepEqual(steps, [1, 1, 2]);
  });

  it("says nothing of whose a place in the question is, the question standing on the group's own rule", async () => {
    const id = await openRun({
      asked: "Розбий текст на тези",
    });

    await writer.step(step(id));

    const [hit] = await search.find(DIRECTORY, "тези");

    // A hit in the question has no address.
    assert.equal(hit.stepId, null);
    assert.equal(hit.agentId, null);
    assert.equal(hit.agentName, null);
    assert.equal(hit.step, null);
  });

  it("stands the freshest message first, whichever flow it stands in", async () => {
    const older = await openRun({
      asked: "Стара ялина",
      startedAt: ASKED_AT - 100_000,
    });
    const newer = await openRun({
      asked: "Свіжа ялина",
      startedAt: ASKED_AT,
    });

    // The older run answered after the newer was asked: by its own hour it comes first.
    await writer.step(
      step(older, {
        said: "Пізня ялина того самого запуску.",
        startedAt: ASKED_AT + 50_000,
        endedAt: ASKED_AT + 60_000,
      }),
    );

    const found = await search.find(DIRECTORY, "ялина");

    assert.deepEqual(
      found.map((hit) => hit.runId),
      [older, newer, older],
    );
    // Ordered by message hour alone, newest first, not grouped by flow.
    assert.deepEqual(
      found.map((hit) => hit.at.getTime()),
      [ASKED_AT + 50_000, ASKED_AT, ASKED_AT - 100_000],
    );
  });

  it("keeps two places of one message in the order the walk ran, their hour being the same", async () => {
    const id = await openRun({
      asked: "Знайди md-файли",
    });

    await writer.step(
      step(id, {
        said: "Ялина у відповіді.",
        startedAt: ASKED_AT + 1_000,
        endedAt: ASKED_AT + 2_000,
        calls: [
          {
            id: crypto.randomUUID(),
            source: "command",
            name: "grep",
            arguments: {},
            pinned: [],
            line: "grep -rn ялина .",
            output: "рядок із ялина",
            refusal: "",
            exitCode: 0,
            serverId: null,
            serverName: "",
            end: "ran",
            startedAt: ASKED_AT + 1_200,
            endedAt: ASKED_AT + 1_400,
          },
        ],
      }),
    );

    // The step's words, then its call's command, then its output: one hour, record order kept.
    assert.deepEqual(
      (await search.find(DIRECTORY, "ялина")).map((hit) => hit.isCall),
      [false, true, true],
    );
  });

  it("gives the person's own question the hour it was asked at, it standing on no step of the walk", async () => {
    await openRun({
      asked: "Розбий текст на тези",
      startedAt: ASKED_AT,
    });

    const [hit] = await search.find(DIRECTORY, "тези");

    assert.equal(hit.step, null);
    assert.equal(hit.at.getTime(), ASKED_AT);
  });

  it("hands back one hit per run, so two runs holding the word both stand in the list", async () => {
    const one = await openRun({
      asked: "Перша ялина",
    });
    const other = await openRun({
      asked: "Друга ялина",
    });

    assert.deepEqual((await search.find(DIRECTORY, "ялина")).map((hit) => hit.runId).sort(), [one, other].sort());
  });
});
