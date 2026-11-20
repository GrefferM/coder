import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WidgetOutput } from "./widget-output";
import { PLAY_CLIP_LABEL } from "../../../speech";
import { aHeardClip, aReadAloud, aSoundPlayer } from "../../../../testing";
import type { ChatMessage } from "../../../../../../contracts";
import type { WidgetExchange } from "../../interfaces";

const QUESTION: ChatMessage = {
  id: "asked-1",
  agentId: "alex",
  from: "person",
  text: "What do you like to eat in the evening",
  at: new Date(2026, 10, 20, 15, 34).toISOString(),
  questionId: "question-1",
  askedAt: 1,
  cost: null,
  answerCeiling: null,
  otherAgentId: null,
  stopReason: null,
  isFailure: false,
  notStarted: null,
  wouldGo: null,
  waitsFor: null,
  compressed: null,
  calls: [],
  began: null,
  stepId: null,
  walkId: "walk-1",
  note: null,
  asked: null,
  fedBy: [],
  attached: [],
};

const EXCHANGE: WidgetExchange = {
  questionId: "question-1",
  question: QUESTION,
  steps: [],
  working: [],
  isOut: false,
};

describe("WidgetOutput", () => {
  it("plays the recording a question was said with, from under its words", async () => {
    const toggle = vi.fn();
    const clip = aHeardClip();

    render(
      <WidgetOutput
        exchanges={[EXCHANGE]}
        agents={[]}
        aloud={aReadAloud()}
        tracks={{
          "question-1": [clip],
        }}
        player={aSoundPlayer({
          toggle,
        })}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: PLAY_CLIP_LABEL,
      }),
    );

    expect(toggle).toHaveBeenCalledWith(clip);
  });

  it("puts no recording under a question that was typed", () => {
    render(
      <WidgetOutput exchanges={[EXCHANGE]} agents={[]} aloud={aReadAloud()} tracks={{}} player={aSoundPlayer()} />,
    );

    expect(screen.getByText(QUESTION.text)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: PLAY_CLIP_LABEL,
      }),
    ).not.toBeInTheDocument();
  });
});
