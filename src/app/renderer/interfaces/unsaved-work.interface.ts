import type { FieldChange } from "./field-change.interface";

/** Unsaved panel work; `blocked` holds the empty required fields, `blockedNote` a block other than those. */
export interface UnsavedWork {
  name: string;
  changes: FieldChange[];
  blocked: string[];
  blockedNote: string | null;
  save: () => Promise<void>;
  discard: () => void;
}
