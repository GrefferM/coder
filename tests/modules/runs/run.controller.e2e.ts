import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { RunController } from "../../../src/modules/runs/controllers/run.controller";
import {
  AskAgainDto,
  CloseRunDto,
  ForgetRunDto,
  ForgetRunsDto,
  ListRunsDto,
  OpenRunDto,
  ReadRunDto,
  SearchRunsDto,
} from "../../../src/modules/runs/dto";
import type { RunKeeper, RunReader, RunSearch, RunWriter } from "../../../src/modules/runs/services";

const DIRECTORY = "/tmp/coder-project";
const AGENT = "22222222-2222-4222-8222-222222222222";
const QUESTION = "44444444-4444-4444-8444-444444444444";
const RUN = "77777777-7777-4777-8777-777777777777";

/** What the door was asked to do, in the order it was asked. */
let asked: { name: string; with: unknown }[] = [];

function took(name: string, answer: unknown) {
  return async (payload: unknown) => {
    asked.push({
      name,
      with: payload,
    });

    return answer;
  };
}

function controller(): RunController {
  const writer = <RunWriter>(<unknown>{
    open: took("open", {
      runId: RUN,
      questionId: QUESTION,
    }),
    step: took("step", "step-1"),
    askAgain: took("askAgain", QUESTION),
    close: took("close", undefined),
  });
  const reader = <RunReader>(<unknown>{
    list: took("list", []),
    one: took("one", null),
  });
  const search = <RunSearch>(<unknown>{
    // The search is asked with two arguments, so this one keeps both rather than only the first.
    find: async (directory: string, query: string) => {
      asked.push({
        name: "find",
        with: [directory, query],
      });

      return [];
    },
  });
  const keeper = <RunKeeper>(<unknown>{
    forget: took("forget", true),
    forgetEnded: took("forgetEnded", 3),
  });

  return new RunController(writer, reader, search, keeper);
}

/** A payload as the boundary builds it: a real dto instance, since a plain object carries no rules to read. */
function dto<TDto extends object>(shape: new () => TDto, fields: Record<string, unknown>): TDto {
  return Object.assign(new shape(), fields);
}

function opening(patch: Record<string, unknown> = {}): OpenRunDto {
  return dto(OpenRunDto, {
    directory: DIRECTORY,
    startedByAgentId: AGENT,
    startedByAgentName: "ТЕЗАР",
    startedByAgentColor: "#b18aff",
    questionId: QUESTION,
    asked: "Розбий текст на тези",
    startedAt: 1_700_000_000_000,
    ...patch,
  });
}

describe("RunController · what it hands on", () => {
  beforeEach(() => {
    asked = [];
  });

  it("gives the opening to the writer whole, and answers with the row it opened", async () => {
    const opened = await controller().open(opening());

    assert.deepEqual(asked[0].name, "open");
    assert.deepEqual(opened, {
      runId: RUN,
      questionId: QUESTION,
    });
  });

  it("asks the search for the folder and the word, and hands the word on as it was typed", async () => {
    // Frame 23t: the door carries the word whole — trimming or lowering it here would search for another thing.
    const door = controller();

    await door.find(
      dto(SearchRunsDto, {
        directory: DIRECTORY,
        query: "  Ялина ",
      }),
    );

    assert.deepEqual(
      asked.map((one) => [one.name, one.with]),
      [["find", [DIRECTORY, "  Ялина "]]],
    );
  });

  it("asks the reader by the folder alone, and for one run by its id alone", async () => {
    // The dto is the door's shape, not the service's: what goes further in is the thing itself.
    const door = controller();

    await door.list(
      dto(ListRunsDto, {
        directory: DIRECTORY,
      }),
    );
    await door.one(
      dto(ReadRunDto, {
        id: RUN,
      }),
    );

    assert.deepEqual(
      asked.map((one) => [one.name, one.with]),
      [
        ["list", DIRECTORY],
        ["one", RUN],
      ],
    );
  });

  it("takes both deletions to the keeper, each in its own words", async () => {
    const door = controller();

    assert.equal(
      await door.forget(
        dto(ForgetRunDto, {
          id: RUN,
        }),
      ),
      true,
    );
    assert.equal(
      await door.forgetAll(
        dto(ForgetRunsDto, {
          directory: DIRECTORY,
        }),
      ),
      3,
    );
    assert.deepEqual(asked[1].with, DIRECTORY);
  });

  it("takes a question asked again and a closing to the writer", async () => {
    const door = controller();

    await door.askAgain(
      dto(AskAgainDto, {
        runId: RUN,
        questionId: QUESTION,
        asked: "Друге",
        askedAgentId: AGENT,
        askedAgentName: "Шукач",
        askedAt: 1_700_000_000_001,
      }),
    );
    await door.close(
      dto(CloseRunDto, {
        runId: RUN,
        endedAt: 1_700_000_000_002,
      }),
    );

    assert.deepEqual(
      asked.map((one) => one.name),
      ["askAgain", "close"],
    );
  });
});

describe("RunController · what it refuses at the door", () => {
  beforeEach(() => {
    asked = [];
  });

  it("refuses an agent id that is no id at all, and writes nothing", async () => {
    // Every thing is found by its own id (and the record keeps that id for ever); a word in its place is refused here.
    await assert.rejects(() =>
      controller().open(
        opening({
          startedByAgentId: "ТЕЗАР",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("refuses a run with no folder to belong to", async () => {
    await assert.rejects(() =>
      controller().open(
        opening({
          directory: "",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("refuses an hour that is not an hour", async () => {
    await assert.rejects(() =>
      controller().open(
        opening({
          startedAt: -1,
        }),
      ),
    );
    await assert.rejects(() =>
      controller().close(
        dto(CloseRunDto, {
          runId: RUN,
          endedAt: "щойно",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("refuses to read or forget a run named by anything but its id", async () => {
    const door = controller();

    await assert.rejects(() =>
      door.one(
        dto(ReadRunDto, {
          id: "останній",
        }),
      ),
    );
    await assert.rejects(() =>
      door.forget(
        dto(ForgetRunDto, {
          id: "останній",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });
});
