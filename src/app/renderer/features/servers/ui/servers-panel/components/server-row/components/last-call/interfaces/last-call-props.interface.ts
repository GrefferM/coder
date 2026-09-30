import type { McpCallFailure } from "../../../../../../../../../interfaces";

export interface LastCallProps {
  /** The last call that did not work, in the server's own words. */
  failure: McpCallFailure;
  /**
   * The news of the row: true where the row is otherwise whole (trouble ground and sign), false where it already says no
   * function answered (quiet).
   */
  isNews: boolean;
  /** Leads the chat to this call and says whether it led anywhere; false when the call's run was forgotten. */
  onShow: () => Promise<boolean>;
}
