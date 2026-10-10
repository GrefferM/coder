import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ukrainianPlural } from "./ukrainian-plural";

describe("ukrainianPlural", () => {
  it("picks the three forms by the last digit", () => {
    assert.equal(ukrainianPlural(1, "агент", "агенти", "агентів"), "агент");
    assert.equal(ukrainianPlural(3, "агент", "агенти", "агентів"), "агенти");
    assert.equal(ukrainianPlural(7, "агент", "агенти", "агентів"), "агентів");
  });

  it("keeps the teens on the many form, where the last digit lies", () => {
    assert.equal(ukrainianPlural(12, "агент", "агенти", "агентів"), "агентів");
    assert.equal(ukrainianPlural(21, "агент", "агенти", "агентів"), "агент");
  });
});
