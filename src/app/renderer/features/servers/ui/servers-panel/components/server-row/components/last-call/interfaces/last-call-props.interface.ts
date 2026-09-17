import type { McpCallFailure } from "../../../../../../../../../interfaces";

export interface LastCallProps {
  /** The last call that did not work, in the server's own words. */
  failure: McpCallFailure;
  /**
   * Whether this is the news of the row. It is, where the row is otherwise whole — then the block takes
   * the trouble ground and the sign. Where the row already says no function has answered, it stands quiet.
   */
  isNews: boolean;
  /**
   * Leads the chat to this very call, and says whether it led anywhere: the record can no longer place a call
   * whose run was forgotten, and then the block says so in place of offering the way.
   */
  onShow: () => Promise<boolean>;
}
