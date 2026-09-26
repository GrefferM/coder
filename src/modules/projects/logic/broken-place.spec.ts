import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { brokenPlace } from "./broken-place";
import type { ValidationError } from "class-validator";

/** A leaf: the field that broke, with the rule it broke. */
function leaf(property: string, rule = "isUuid"): ValidationError {
  return <ValidationError>{
    property,
    children: [],
    constraints: {
      [rule]: `${property} ${rule}`,
    },
  };
}

/** A branch: a property with something wrong under it. */
function branch(property: string, children: ValidationError[], value?: unknown): ValidationError {
  return <ValidationError>{
    property,
    value,
    children,
  };
}

describe("brokenPlace · where a project file first goes wrong", () => {
  it("is null where the validator refused but named no field", () => {
    assert.equal(brokenPlace([]), null);
  });

  it("names a field of the project itself, with an empty trail", () => {
    assert.deepEqual(brokenPlace([leaf("name", "isNotEmpty")]), {
      trail: [],
      field: "name",
      rule: "isNotEmpty",
    });
  });

  it("names the thing by its own name, taken from the row that carries it", () => {
    const tree = [
      branch("commands", [
        branch("0", [leaf("id")], {
          name: "run_tests",
        }),
      ]),
    ];

    assert.deepEqual(brokenPlace(tree), {
      trail: [
        {
          kind: "command",
          name: "run_tests",
        },
      ],
      field: "id",
      rule: "isUuid",
    });
  });

  it("names a model by its title, since a model has no name", () => {
    const tree = [
      branch("models", [
        branch("2", [leaf("id")], {
          title: "gpt-4o",
        }),
      ]),
    ];

    assert.deepEqual(brokenPlace(tree)?.trail, [
      {
        kind: "model",
        name: "gpt-4o",
      },
    ]);
  });

  it("walks a list inside a thing, naming every named step on the way", () => {
    const tree = [
      branch("commands", [
        branch(
          "0",
          [
            branch("parameters", [
              branch("1", [leaf("id")], {
                name: "url",
              }),
            ]),
          ],
          {
            name: "fetch",
          },
        ),
      ]),
    ];

    assert.deepEqual(brokenPlace(tree), {
      trail: [
        {
          kind: "command",
          name: "fetch",
        },
        {
          kind: "parameter",
          name: "url",
        },
      ],
      field: "id",
      rule: "isUuid",
    });
  });

  it("leaves a name null where the thing has none, as a link does not", () => {
    const tree = [branch("links", [branch("0", [leaf("fromId")], {})])];

    assert.deepEqual(brokenPlace(tree)?.trail, [
      {
        kind: "link",
        name: null,
      },
    ]);
  });

  it("follows the first failing branch, because one place is enough to stop a file opening", () => {
    const tree = [
      branch("models", [
        branch("0", [leaf("id")], {
          title: "m",
        }),
      ]),
      branch("agents", [
        branch("0", [leaf("name")], {
          name: "a",
        }),
      ]),
    ];

    assert.equal(brokenPlace(tree)?.trail[0].kind, "model");
  });
});
