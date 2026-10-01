import { describe, expect, it } from "vitest";
import { fittedThread } from "./fitted-thread";
import type { ChatTurn } from "../../../interfaces";

/** One input and its answer. */
function pair(input: string, answer: string): ChatTurn[] {
  return [
    {
      from: "person",
      text: input,
    },
    {
      from: "agent",
      text: answer,
    },
  ];
}

const THREAD: ChatTurn[] = [...pair("перше", "один"), ...pair("друге", "два"), ...pair("третє", "три")];

describe("fittedThread", () => {
  it("keeps the whole thread where it fits", () => {
    expect(fittedThread(THREAD, 100)).toEqual(THREAD);
  });

  it("drops the oldest pairs first, keeping the newest that fit", () => {
    // «третє»+«три» is 8, «друге»+«два» is 8, «перше»+«один» is 9.
    expect(fittedThread(THREAD, 16)).toEqual([...pair("друге", "два"), ...pair("третє", "три")]);
  });

  it("never keeps half a pair, and never an older pair past one that did not fit", () => {
    expect(fittedThread([...pair("довге питання", "довга відповідь"), ...pair("а", "б")], 3)).toEqual(pair("а", "б"));
    expect(fittedThread([...pair("а", "б"), ...pair("довге питання", "довга відповідь")], 3)).toEqual([]);
  });

  it("gives nothing where the prompt and the question leave no room", () => {
    expect(fittedThread(THREAD, 0)).toEqual([]);
  });

  it("counts a character the person sees as one", () => {
    expect(fittedThread(pair("🙂", "🙂"), 2)).toEqual(pair("🙂", "🙂"));
  });
});
