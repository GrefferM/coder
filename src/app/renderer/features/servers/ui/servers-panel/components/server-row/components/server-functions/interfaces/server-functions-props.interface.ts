import type { FunctionRow } from "../../../../../../../interfaces";

export interface ServerFunctionsProps {
  /** What the server hands over now, and what a grant still points at; in display order. */
  rows: FunctionRow[];
}
