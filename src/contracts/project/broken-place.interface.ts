/** The kind of a named thing a project file can go wrong in; the screen says each one in its own word. */
export type BrokenPlaceKind = "model" | "prompt" | "command" | "parameter" | "server" | "agent" | "grant" | "link";

/** One named step on the way to the wrong field: what kind of thing it is, and its own name where it has one. */
export interface BrokenStep {
  kind: BrokenPlaceKind;
  /** The thing's own name — a model's title, a command's name; null where it has none, as a link does not. */
  name: string | null;
}

/**
 * Where a project file first goes wrong, as the screen needs it to name the place in words: the named things on
 * the way down to the wrong field, the field itself, and the rule it broke. An empty trail is a field of the
 * project itself. It crosses the bridge in the refusal's say, and the renderer turns it into a Ukrainian line.
 */
export interface BrokenPlace {
  trail: BrokenStep[];
  field: string;
  rule: string;
}
