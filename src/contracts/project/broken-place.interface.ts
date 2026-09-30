/** The kind of named thing a project file can go wrong in; the screen names each kind in its own word. */
export type BrokenPlaceKind = "model" | "prompt" | "command" | "parameter" | "server" | "agent" | "grant" | "link";

/** One named step on the way to the wrong field: its kind and its name, if any. */
export interface BrokenStep {
  kind: BrokenPlaceKind;
  /** The thing's own name (a model's title, a command's name); null where it has none, as a link. */
  name: string | null;
}

/**
 * Where a project file first goes wrong: the named things down to the wrong field, the field, and the rule broken. An
 * empty trail is a field of the project itself.
 */
export interface BrokenPlace {
  trail: BrokenStep[];
  field: string;
  rule: string;
}
