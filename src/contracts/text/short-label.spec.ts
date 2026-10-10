import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shortLabel } from "./short-label";

describe("shortLabel", () => {
  it("leaves a label the head has room for", () => {
    assert.equal(shortLabel("РЕВ'ЮЕР", 14), "РЕВ'ЮЕР");
  });

  it("leaves a label that fills the room exactly", () => {
    assert.equal(shortLabel("ПЛАНУВАЛЬНИКИ", 13), "ПЛАНУВАЛЬНИКИ");
  });

  it("cuts a longer label to that room, ellipsis and all", () => {
    assert.equal(shortLabel("ГОЛОВНИЙ ПЛАНУВАЛЬНИК", 14), "ГОЛОВНИЙ ПЛАН…");
  });

  it("keeps no space before the ellipsis", () => {
    assert.equal(shortLabel("ГОЛОВНИЙ РЕВ'ЮЕР", 10), "ГОЛОВНИЙ…");
  });
});
