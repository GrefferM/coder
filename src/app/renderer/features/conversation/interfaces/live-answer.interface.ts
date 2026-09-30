import type { LiveCall } from "../../../interfaces";

/** The answer's text so far and the calls made, in the order they went out. */
export interface LiveAnswer {
  text: string;
  calls: LiveCall[];
}
