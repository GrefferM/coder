import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addedMoney } from "./added-money";

describe("addedMoney · several bills added into one", () => {
  it("adds what is known", () => {
    assert.equal(addedMoney([1.5, 2, 0.25]), 3.75);
  });

  it("leaves out a bill nobody knows rather than counting it as nought", () => {
    assert.equal(addedMoney([1.5, null, 2]), 3.5);
  });

  it("says the whole is unknown where not one bill is known, so no zero is believed", () => {
    assert.equal(addedMoney([null, null]), null);
  });

  it("says nothing of nothing, for the same reason", () => {
    assert.equal(addedMoney([]), null);
  });

  it("counts a bill of nothing that somebody does know", () => {
    assert.equal(addedMoney([0, null]), 0);
  });
});
