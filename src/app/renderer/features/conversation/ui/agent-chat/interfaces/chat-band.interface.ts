import type { StreamSearchProps } from "../../stream-search/interfaces";
import type { ChatHead } from "./chat-head.interface";

/** What stands over the stream: the band about the run on screen, and the stream's own search under it. */
export interface ChatBand {
  /** What the band says — null while nothing has been said at all. */
  head: ChatHead | null;
  search: StreamSearchProps;
}
