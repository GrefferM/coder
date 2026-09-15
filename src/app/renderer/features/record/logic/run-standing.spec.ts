import { describe, expect, it } from "vitest";
import { runStanding } from "./run-standing";
import { RUN_DONE, RUN_FAILED, RUN_NOT_SENT, RUN_STOPPED } from "../constants";

describe("runStanding", () => {
  it("says done only where every turn of the walk answered", () => {
    expect(runStanding([])).toBe(RUN_DONE);
    expect(runStanding(["done", "done"])).toBe(RUN_DONE);
  });

  it("reads the whole walk, so a turn that fell does not hide behind one that answered after it", () => {
    // The bug this guards: the word was taken from the turn that came back last, and a fallen branch stood under
    // «ГОТОВО» whenever another branch happened to finish after it.
    expect(runStanding(["failed", "done"])).toBe(RUN_FAILED);
    expect(runStanding(["done", "failed"])).toBe(RUN_FAILED);
  });

  it("says nothing was sent where the turns that did not answer never left", () => {
    // A provider that never answered, and a model that came back with nothing.
    expect(runStanding(["unreachable"])).toBe(RUN_NOT_SENT);
    expect(runStanding(["silent"])).toBe(RUN_NOT_SENT);
    expect(runStanding(["done", "noKey", "tooLong"])).toBe(RUN_NOT_SENT);
  });

  it("takes the worse word where the turns ended differently, a fall being worse than nothing sent", () => {
    // «УПАВ» stands before «НЕ ПІШОВ» — being sent and broken is news of another kind.
    expect(runStanding(["unreachable", "failed"])).toBe(RUN_FAILED);
    expect(runStanding(["failed", "silent"])).toBe(RUN_FAILED);
  });

  it("says a hand where a hand stopped every turn that did not answer", () => {
    expect(runStanding(["stopped"])).toBe(RUN_STOPPED);
    expect(runStanding(["done", "stopped"])).toBe(RUN_STOPPED);
  });

  it("lets a hand explain only what it stopped, so anything beside it is the news", () => {
    // A stop is a person's act, and it says nothing about the branch that fell next to it.
    expect(runStanding(["stopped", "failed"])).toBe(RUN_FAILED);
    expect(runStanding(["stopped", "unreachable"])).toBe(RUN_NOT_SENT);
  });

  it("counts an end word it does not know as a fall, a new end never being a gentle one", () => {
    // Silence would be the dangerous answer here: a word nobody has taught this rule must not read as «ГОТОВО».
    expect(runStanding(["somethingNew"])).toBe(RUN_FAILED);
  });

  it("takes the ends the record keeps for an answer cut short as falls, the words having gone out", () => {
    // The ceiling and the calls both ran — something was sent, and nothing whole came back.
    expect(runStanding(["ceiling"])).toBe(RUN_FAILED);
    expect(runStanding(["calls"])).toBe(RUN_FAILED);
  });
});
