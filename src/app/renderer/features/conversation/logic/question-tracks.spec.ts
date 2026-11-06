import { describe, expect, it } from "vitest";
import { questionTracks } from "./question-tracks";
import { RUN_DONE } from "../../record";
import { aHeardClip } from "../../../testing";
import type { WholeRun } from "../../record";

const RECORDING = {
  id: "recording-1",
  place: 0,
  mimeType: "audio/webm",
  durationMs: 7_000,
  peaks: [0.2, 1],
};

/** A run of two questions, the first said with one recording. */
function run(): WholeRun {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "ТЕЗАР",
    startedByAgentColor: "#b18aff",
    askedAgentId: "agent-1",
    askedAgentName: "ТЕЗАР",
    asked: "Розбий текст на тези",
    state: RUN_DONE,
    startedAt: new Date("2026-08-22T19:26:56"),
    askedAt: new Date("2026-08-22T19:26:56"),
    endedAt: null,
    questions: [
      {
        id: "question-1",
        place: 1,
        asked: "Розбий текст на тези",
        askedAt: new Date("2026-08-22T19:26:56"),
        askedAgentId: "agent-1",
        attached: [],
        recordings: [RECORDING],
      },
      {
        id: "question-2",
        place: 2,
        asked: "Ще раз",
        askedAt: new Date("2026-08-22T19:28:00"),
        askedAgentId: "agent-1",
        attached: [],
        recordings: [],
      },
    ],
    steps: 0,
    money: 0,
    worked: 0,
    walk: [],
    memories: [],
  };
}

describe("questionTracks", () => {
  it("reads an opened run's recordings by their own ids, their sound left to the record", () => {
    expect(questionTracks({}, run())).toEqual({
      "question-1": [
        {
          id: "recording-1",
          mimeType: "audio/webm",
          durationMs: 7_000,
          peaks: [0.2, 1],
          audio: null,
        },
      ],
      "question-2": [],
    });
  });

  it("takes a question said on this screen from the screen, its sound at hand", () => {
    const clip = aHeardClip();

    expect(
      questionTracks(
        {
          "question-1": [clip],
        },
        run(),
      )["question-1"],
    ).toEqual([clip]);
  });

  it("holds only what was said on this screen where no run is opened", () => {
    const clip = aHeardClip();

    expect(
      questionTracks(
        {
          "question-3": [clip],
        },
        null,
      ),
    ).toEqual({
      "question-3": [clip],
    });
  });
});
