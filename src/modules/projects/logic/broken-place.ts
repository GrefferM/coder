import { BROKEN_PLACE_KINDS, BROKEN_RULE_UNKNOWN } from "../constants";
import type { BrokenPlace, BrokenStep } from "../../../contracts";
import type { ValidationError } from "class-validator";

/**
 * Where a project file first goes wrong, as the screen says it: the named things down to the wrong field, then the
 * field and the broken rule; null where the validator named nothing.
 *
 * Walks the first failing branch to its first leaf; a list-valued property (`commands`, `parameters`, …) is a named
 * thing whose name is read from the row under it.
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

/** A thing's own name where the failed row carries it: a model's title, a command's name. */
function nameOf(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const thing = <Record<string, unknown>>value;
  const name = thing.name ?? thing.title;

  return typeof name === "string" && name !== "" ? name : null;
}
