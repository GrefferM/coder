import { BROKEN_PLACE_KINDS, BROKEN_RULE_UNKNOWN } from "../constants";
import type { BrokenPlace, BrokenStep } from "../../../contracts";
import type { ValidationError } from "class-validator";

/**
 * Where a project file first goes wrong, named the way the screen will say it: the named things on the way down
 * to the wrong field, then the field and the rule it broke. Null where the validator refused but named nothing.
 *
 * The validator answers with a tree, and only its leaves say what is actually wrong — a branch above one merely
 * says that something under it is. So the walk goes down the first failing branch to the first leaf. A branch
 * whose property is a list (`commands`, `parameters`, …) is a named thing: the row under it carries the thing
 * itself, so its name is taken there and the walk goes on inside it.
 */
export function brokenPlace(errors: ValidationError[]): BrokenPlace | null {
  const trail: BrokenStep[] = [];
  const [firstError] = errors;
  let node: ValidationError | undefined = firstError;

  while (node !== undefined) {
    const kind = BROKEN_PLACE_KINDS[node.property];
    const children: ValidationError[] = node.children ?? [];
    const [row] = children;

    if (kind !== undefined && row !== undefined) {
      trail.push({
        kind,
        name: nameOf(row.value),
      });
      const [inner] = row.children ?? [];
      node = inner;

      continue;
    }

    if (row !== undefined) {
      node = row;

      continue;
    }

    return {
      trail,
      field: node.property,
      rule: Object.keys(node.constraints ?? {})[0] ?? BROKEN_RULE_UNKNOWN,
    };
  }

  return null;
}

/** A thing's own name, where the row that failed carries the thing: a model's title, a command's name. */
function nameOf(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const thing = <Record<string, unknown>>value;
  const name = thing.name ?? thing.title;

  return typeof name === "string" && name !== "" ? name : null;
}
