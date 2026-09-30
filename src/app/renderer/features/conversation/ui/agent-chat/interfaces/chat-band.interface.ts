import type { StreamSearchProps } from "../../stream-search/interfaces";
import type { ChatHead } from "./chat-head.interface";

/** What stands over the stream: the band about the run on screen and the stream's search under it. */
export interface ChatBand {
  /** What the band says; `null` while nothing has been said. */
  head: ChatHead | null;
  /** Writes the stream out as a transcript; `null` when there is nothing on screen to write. */
  onExport: (() => void) | null;
  search: StreamSearchProps;
}
