import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { RunController } from "../../../src/modules/runs/controllers/run.controller";
import { ForgetRunDto, ForgetRunsDto, ListRunsDto, ReadRunDto, SearchRunsDto } from "../../../src/modules/runs/dto";
import type { RunKeeper, RunReader, RunSearch } from "../../../src/modules/runs/services";

const DIRECTORY = "/tmp/coder-project";
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
  const reader = <RunReader>(<unknown>{
    list: took("list", []),
    one: took("one", null),
  });
  const search = <RunSearch>(<unknown>{
    // Keeps both arguments of the two-argument search.
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

  return new RunController(reader, search, keeper);
}

/** A payload as the boundary builds it: a real dto instance, since a plain object carries no rules. */
function dto<TDto extends object>(shape: new () => TDto, fields: Record<string, unknown>): TDto {
  return Object.assign(new shape(), fields);
}

describe("RunController · what it hands on", () => {
  beforeEach(() => {
    asked = [];
  });

  it("asks the search for the folder and the word, and hands the word on as it was typed", async () => {
    // The word is passed whole; trimming or lowercasing would search for another thing.
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
    // The dto is the door's shape, not the service's.
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
});

describe("RunController · what it refuses at the door", () => {
  beforeEach(() => {
    asked = [];
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
