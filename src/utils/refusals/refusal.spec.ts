import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Refusal } from "./refusal";

describe("Refusal", () => {
  it("carries the code the app knows it by", () => {
    const refusal = new Refusal("NO_SUCH_PROJECT");

    assert.equal(refusal.code, "NO_SUCH_PROJECT");
  });

  it("says the code as its message too, so a log of it is not an empty line", () => {
    assert.equal(new Refusal("NO_SUCH_PROJECT").message, "NO_SUCH_PROJECT");
  });

  it("is an Error, and names itself apart from every other one", () => {
    // The name is how the boundary tells a refusal the app meant from a fall it did not.
    const refusal = new Refusal("NO_SUCH_PROJECT");

    assert.ok(refusal instanceof Error);
    assert.ok(refusal instanceof Refusal);
    assert.equal(refusal.name, "Refusal");
  });

  it("can be thrown and caught as itself", () => {
    assert.throws(
      () => {
        throw new Refusal("NO_KEY");
      },
      (thrown: unknown) => thrown instanceof Refusal && thrown.code === "NO_KEY",
    );
  });
});
