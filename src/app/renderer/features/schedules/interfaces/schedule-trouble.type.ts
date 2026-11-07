/** What keeps a schedule from running: its agent gone, or the first field not written, by its name. */
export type ScheduleTrouble =
  | {
      kind: "agentGone";
    }
  | {
      kind: "unfilled";
      field: string;
    };
