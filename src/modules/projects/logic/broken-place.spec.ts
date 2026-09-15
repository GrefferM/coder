import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { brokenPlace } from "./broken-place";
import type { ValidationError } from "class-validator";

/** One node of the validator's tree, as it hands it over. */
function at(property: string, children: ValidationError[] = []): ValidationError {
  return <ValidationError>{
    property,
    children,
    constraints:
      children.length === 0
        ? {
            isUuid: "id must be a UUID",
          }
        : undefined,
  };
}

describe("brokenPlace · where a project file first goes wrong", () => {
  it("says nothing where the validator refused but named no field", () => {
    assert.equal(brokenPlace([]), "");
  });

  it("names a field of the config itself", () => {
    assert.equal(brokenPlace([at("name")]), "name");
  });

  it("hangs a row's number on the list above it with no dot between", () => {
    assert.equal(brokenPlace([at("agents", [at("1", [at("name")])])]), "agents[1].name");
  });

  it("walks all the way to the leaf, since a branch only says something under it is wrong", () => {
    const tree = [at("agents", [at("1", [at("tools", [at("7", [at("pinned", [at("0", [at("id")])])])])])])];

    assert.equal(brokenPlace(tree), "agents[1].tools[7].pinned[0].id");
  });

  it("follows the first failing branch, because one place is enough to stop a file opening", () => {
    assert.equal(brokenPlace([at("models", [at("0", [at("id")])]), at("agents")]), "models[0].id");
  });
});
