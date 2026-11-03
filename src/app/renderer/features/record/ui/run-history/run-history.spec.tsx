import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RunHistory } from "./run-history";
import {
  RUN_HISTORY_EMPTY_NOTE,
  RUN_HISTORY_SWEEP_NOTE,
  RUN_HISTORY_FORGET_BACKGROUND_COLOR,
  RUN_HISTORY_FORGET_LABEL,
  RUN_HISTORY_OPEN_HINT,
  RUN_HISTORY_FORGET_SIZE_PX,
  RUN_HISTORY_STARTED_PREFIX,
} from "./constants";
import { FOUND_CEILING_NOTE, RUN_FAILED, RUN_RUNNING, RUN_STATE_LABELS } from "../../constants";
import { RUN_HITS_LIMIT } from "../../../../../../contracts";
import { RUN_SEARCH_CLEAR_LABEL, RUN_SEARCH_PLACEHOLDER } from "./constants";
import { foundAddress, foundCount, nothingFoundNote } from "../../words";
import { dayLabel, timeLabel } from "../../../../utils/dates";
import { PERSON_NAME } from "../../../../constants";
import type { RunHit } from "../../interfaces";
import type { NamedAgent } from "../../../../interfaces";
import type { RunRow } from "../../interfaces";

// The project's agents; row names are looked up by agent id.
const AGENTS: NamedAgent[] = [
  {
    id: "agent-1",
    name: "Тезар",
    color: "#b18aff",
  },
  {
    id: "agent-2",
    name: "Кодер",
    color: "#6fd3d8",
  },
];

function run(patch: Partial<RunRow> = {}): RunRow {
  return {
    id: "run-1",
    startedByAgentId: "agent-1",
    startedByAgentName: "Тезар",
    startedByAgentColor: "#b18aff",
    asked: "Розбий текст на тези",
    state: "done",
    startedAt: new Date("2026-08-22T15:10:00"),
    askedAt: new Date("2026-08-22T15:10:00"),
    endedAt: new Date("2026-08-22T15:10:44"),
    steps: 3,
    money: 0.0312,
    worked: 44_000,
    askedAgentId: "agent-1",
    askedAgentName: "Тезар",
    ...patch,
  };
}

/** A search hit in one run: the found words and where a press lands. */
function hit(patch: Partial<RunHit> = {}): RunHit {
  return {
    runId: "run-1",
    questionId: "question-1",
    stepId: "step-2",
    agentId: "agent-2",
    agentName: "ТЕСТЕР",
    step: 2,
    at: new Date("2026-09-07T14:26:00"),
    found: "Поклав кешування у fetchUser",
    isCall: false,
    ...patch,
  };
}

describe("the search over the history", () => {
  it("stands over the list with the placeholder that says word for word where it looks", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText(RUN_SEARCH_PLACEHOLDER)).toBeInTheDocument();
  });

  it("says how many runs the record holds while nothing is typed, and the places and runs found once something is", () => {
    // «142» at rest, «12 З 142» with a word: the second number is the record's count either way.
    const { rerender } = render(
      <RunHistory
        runs={[
          run(),
          run({
            id: "run-2",
          }),
        ]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();

    rerender(
      <RunHistory
        runs={[
          run(),
          run({
            id: "run-2",
          }),
        ]}
        agents={AGENTS}
        query="кеш"
        hits={[hit()]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    // One place in one of two runs: the second number is not the record's count.
    expect(screen.getByText(foundCount("кеш", 1, 1, 2))).toBeInTheDocument();
  });

  it("stands a card for every place the word was found, and holds no run the word is in none of", () => {
    // Every place a word stands in is its own card, even several in one flow.
    render(
      <RunHistory
        runs={[
          run(),
          run({
            id: "run-2",
            asked: "Зовсім інше питання",
          }),
        ]}
        agents={AGENTS}
        query="кеш"
        hits={[hit()]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(/Поклав/)).toBeInTheDocument();
    expect(screen.queryByText("Зовсім інше питання")).not.toBeInTheDocument();
    // The run holding the place is named once, on the rule.
    expect(screen.getAllByText("Розбий текст на тези")).toHaveLength(1);
  });

  it("stands one card per place, so a flow that said the word twice stands twice", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[
          hit(),
          hit({
            stepId: "step-4",
            found: "І ще раз кешування, нижче",
          }),
        ]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(/Поклав/)).toBeInTheDocument();
    expect(screen.getByText(/І ще раз/)).toBeInTheDocument();
  });

  it("hands the pressed place along with its flow, so the stream knows where to land", async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    const found = hit();

    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[found]}
        onQuery={() => {}}
        refusal={null}
        onOpen={onOpen}
        onForget={() => {}}
      />,
    );

    await user.click(screen.getByText(/Поклав/));

    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "run-1",
      }),
      found,
    );
  });

  it("carries neither the cross nor the flow's numbers on a found place", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[hit()]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.queryByLabelText(RUN_HISTORY_FORGET_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByText(/3 КРОКИ/)).not.toBeInTheDocument();
    expect(screen.queryByText(RUN_HISTORY_SWEEP_NOTE)).not.toBeInTheDocument();
  });

  it("signs a found place with the agent whose message it is, and not with whom the flow was asked last", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[hit()]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText("Кодер")).toBeInTheDocument();
  });

  it("wears the step of the walk and the hour of its own message, the way that message's card wears them", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[hit()]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    // «КРОК 2 · 14:26»: the hour is the message's, not the flow's 15:10.
    expect(screen.getByText(foundAddress(2, timeLabel(new Date("2026-09-07T14:26:00"))))).toBeInTheDocument();
  });

  it("signs a place standing in the question as the person's, they being who said it", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="тези"
        hits={[
          hit({
            stepId: null,
            agentId: null,
            agentName: null,
            step: null,
            at: new Date("2026-08-22T15:10:00"),
            found: "Розбий текст на тези",
          }),
        ]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(PERSON_NAME)).toBeInTheDocument();
    // The person's words have no step but still carry an hour.
    expect(screen.getByText(timeLabel(new Date("2026-08-22T15:10:00")))).toBeInTheDocument();
    expect(screen.queryByText(/КРОК/)).not.toBeInTheDocument();
  });

  it("stands the places in the order the record handed them, the freshest message first", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[
          hit({
            stepId: "step-3",
            step: 3,
            at: new Date("2026-09-07T16:40:00"),
            found: "Пізніше про кеш",
          }),
          hit({
            stepId: "step-1",
            step: 1,
            at: new Date("2026-09-07T09:05:00"),
            found: "Раніше про кеш",
          }),
        ]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    // Order is by message hour alone; the list does not rearrange it.
    const said = screen.getAllByLabelText(RUN_HISTORY_OPEN_HINT).map((card) => card.textContent ?? "");

    expect(said[0]).toContain("Пізніше про кеш");
    expect(said[1]).toContain("Раніше про кеш");
  });

  it("hands the word back on every letter, so the number and the list move with the hand", async () => {
    const onQuery = vi.fn();
    const user = userEvent.setup();

    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={onQuery}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    await user.type(screen.getByPlaceholderText(RUN_SEARCH_PLACEHOLDER), "к");

    expect(onQuery).toHaveBeenCalledWith("к");
  });

  it("says the record rather than a nought where the word is in nothing", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="ялина"
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    // «0 МІСЦЬ · 1 ЗАПУСК»: the second number says the record has the run but not the word.
    expect(screen.getByText(foundCount("ялина", 0, 0, 1))).toBeInTheDocument();
  });

  it("says the ceiling with a word and tells the hand what to do about it", () => {
    const many = Array.from(
      {
        length: RUN_HITS_LIMIT,
      },
      (_, place) =>
        hit({
          stepId: `step-${place}`,
          found: `Місце ${place} з кешем`,
        }),
    );

    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={many}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    // Counting stopped at the limit: the second number becomes a word and the sentence says «add a letter».
    expect(screen.getByText(foundCount("кеш", RUN_HITS_LIMIT, 1, 1))).toBeInTheDocument();
    expect(screen.getByText(FOUND_CEILING_NOTE)).toBeInTheDocument();
  });

  it("names the run over the first of its places, and not over every one of them", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[
          hit({
            stepId: "step-1",
            found: "Перше про кеш",
          }),
          hit({
            stepId: "step-2",
            found: "Друге про кеш",
          }),
        ]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getAllByText(run().asked)).toHaveLength(1);
  });

  it("names the run again wherever the record jumps to another one, the same run included", () => {
    const other = run({
      id: "run-2",
      asked: "Онови залежності",
      askedAt: new Date("2026-08-22T09:00:00"),
    });

    render(
      <RunHistory
        runs={[run(), other]}
        agents={AGENTS}
        query="кеш"
        hits={[
          hit({
            stepId: "step-1",
          }),
          hit({
            runId: "run-2",
            stepId: "step-2",
          }),
          hit({
            stepId: "step-3",
          }),
        ]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    // Two interleaved runs: the first is named again each time the list jumps back.
    expect(screen.getAllByText(run().asked)).toHaveLength(2);
    expect(screen.getAllByText(other.asked)).toHaveLength(1);
  });

  it("says the day and the hour of the run on its rule, and not the hour of the place under it", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[hit()]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    // The rule carries the run's address («СЬОГОДНІ 15:10»); the row carries its message's 14:26.
    const asked = run().askedAt;

    expect(screen.getByText(`${dayLabel(asked, new Date())} ${timeLabel(asked)}`)).toBeInTheDocument();
  });

  it("gives the rule no way to be pressed: the hand presses a row, not a rule", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[hit()]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getAllByLabelText(RUN_HISTORY_OPEN_HINT)).toHaveLength(1);
    expect(screen.getByText(run().asked).closest("button")).toBeNull();
  });

  it("says in one sentence, with the word in it, that this word is in nothing — and not that the record is empty", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="мігра"
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(nothingFoundNote("мігра"))).toBeInTheDocument();
    expect(screen.queryByText(RUN_HISTORY_EMPTY_NOTE)).not.toBeInTheDocument();
    expect(screen.queryByText(RUN_HISTORY_SWEEP_NOTE)).not.toBeInTheDocument();
  });

  it("offers a cross only while there is a word, and empties the field by it", async () => {
    const onQuery = vi.fn();
    const user = userEvent.setup();
    const { unmount } = render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={onQuery}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.queryByLabelText(RUN_SEARCH_CLEAR_LABEL)).not.toBeInTheDocument();
    unmount();

    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="кеш"
        hits={[hit()]}
        onQuery={onQuery}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    await user.click(screen.getByLabelText(RUN_SEARCH_CLEAR_LABEL));

    // Clearing the word brings the whole list back.
    expect(onQuery).toHaveBeenCalledWith("");
  });

  it("brings the whole list back the moment the field empties, the record never having been touched", () => {
    const { rerender } = render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query="мігра"
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    rerender(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText("Розбий текст на тези")).toBeInTheDocument();
  });
});

describe("RunHistory", () => {
  it("says at the end of the list how long the record lives", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(RUN_HISTORY_SWEEP_NOTE)).toBeInTheDocument();
  });

  it("says no rule when there is nothing in the list", () => {
    render(
      <RunHistory
        runs={[]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.queryByText(RUN_HISTORY_SWEEP_NOTE)).not.toBeInTheDocument();
  });

  it("says plainly when nothing has run yet", () => {
    render(
      <RunHistory
        runs={[]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText(RUN_HISTORY_EMPTY_NOTE)).toBeInTheDocument();
  });

  it("says what was asked, how long it took, what it cost — and whom it was asked last", () => {
    // The head names the last question's addressee in that agent's colour.
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText("Тезар")).toHaveStyle({
      color: "#b18aff",
    });
    expect(screen.getByText("Розбий текст на тези")).toBeInTheDocument();
    expect(screen.getByText("15:10 · 44 c")).toBeInTheDocument();
    expect(screen.getByText(/3 КРОКИ/)).toBeInTheDocument();
  });

  it("hands the run out when its row is pressed, since the row is the way into it", async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();

    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={onOpen}
        onForget={() => {}}
      />,
    );

    await user.click(screen.getByText("Розбий текст на тези"));

    // A row pressed with no word opens the run whole, with no place.
    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "run-1",
      }),
      null,
    );
  });

  it("keeps the deletion's place on the head line whether the cross is there or not", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    const place = screen.getByText("15:10 · 44 c").parentElement?.lastElementChild;

    expect(place).toHaveStyle({
      width: `${RUN_HISTORY_FORGET_SIZE_PX}px`,
      height: `${RUN_HISTORY_FORGET_SIZE_PX}px`,
    });
  });

  it("gives the deletion its box only with the row, so forty rows are forty glyphs and no wall", async () => {
    const user = userEvent.setup();

    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    const cross = screen.getByRole("button", {
      name: RUN_HISTORY_FORGET_LABEL,
    });

    expect(cross).toHaveStyle({
      background: "transparent",
    });

    await user.hover(screen.getByLabelText(RUN_HISTORY_OPEN_HINT));

    // The box behind the glyph shares the row's hover.
    expect(cross).toHaveStyle({
      background: RUN_HISTORY_FORGET_BACKGROUND_COLOR,
    });
  });

  it("draws the deletion on a row nobody is pointing at: a held-open gap reads as something missing", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    ).toBeVisible();
  });

  it("asks about the run rather than taking it, since there is nowhere to take it back from", async () => {
    const onForget = vi.fn();
    const onOpen = vi.fn();
    const user = userEvent.setup();

    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={onOpen}
        onForget={onForget}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    );

    // Forgetting and opening are separate presses.
    expect(onForget).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "run-1",
      }),
    );
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("keeps the question to a heading, however long the question was", () => {
    render(
      <RunHistory
        onOpen={() => {}}
        onForget={() => {}}
        refusal={null}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        runs={[
          run({
            asked: "Дуже довге питання, ".repeat(40),
          }),
        ]}
      />,
    );

    // The row is a heading showing the whole question.
    expect(screen.getByText(/Дуже довге питання/)).toHaveStyle({
      overflow: "hidden",
    });
  });

  it("leaves the count off a run of one step, since there is nothing to count", () => {
    render(
      <RunHistory
        onOpen={() => {}}
        onForget={() => {}}
        refusal={null}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        runs={[
          run({
            steps: 1,
          }),
        ]}
      />,
    );

    expect(screen.queryByText(/КРОК/)).not.toBeInTheDocument();
  });

  it("marks a run that fell and one that is still going, and says nothing about an ordinary end", () => {
    render(
      <RunHistory
        onOpen={() => {}}
        onForget={() => {}}
        refusal={null}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        runs={[
          run({
            id: "run-2",
            state: "running",
            endedAt: null,
          }),
          run({
            id: "run-3",
            state: "failed",
          }),
          run(),
        ]}
      />,
    );

    expect(screen.getByText(RUN_STATE_LABELS[RUN_RUNNING])).toBeInTheDocument();
    expect(screen.getByText(RUN_STATE_LABELS[RUN_FAILED])).toBeInTheDocument();
  });

  it("wears the hour of its last question and says quietly when it began, once it is older than its group", () => {
    render(
      <RunHistory
        runs={[
          run({
            startedAt: new Date("2026-08-20T09:00:00"),
            askedAt: new Date("2026-08-22T15:10:00"),
            endedAt: new Date("2026-08-22T15:10:44"),
          }),
        ]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    // A run re-asked rises to the top with the new question's hour and span.
    expect(screen.getByText("15:10 · 44 c")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${RUN_HISTORY_STARTED_PREFIX}20 СЕР`))).toBeInTheDocument();
  });

  it("says nothing about beginnings when the flow began in the group it stands in", () => {
    render(
      <RunHistory
        runs={[run()]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.queryByText(new RegExp(RUN_HISTORY_STARTED_PREFIX))).not.toBeInTheDocument();
  });

  it("offers no deletion on a run still going: the record is still being written", () => {
    render(
      <RunHistory
        runs={[
          run({
            state: "running",
            endedAt: null,
          }),
        ]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal={null}
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: RUN_HISTORY_FORGET_LABEL,
      }),
    ).not.toBeInTheDocument();
  });

  it("says what the record answered when it could not be read, rather than calling it empty", () => {
    render(
      <RunHistory
        runs={[]}
        agents={AGENTS}
        query=""
        hits={[]}
        onQuery={() => {}}
        refusal="Запис не прочитався · SQLITE_CANTOPEN: unable to open database file"
        onOpen={() => {}}
        onForget={() => {}}
      />,
    );

    expect(screen.getByText("Запис не прочитався · SQLITE_CANTOPEN: unable to open database file")).toBeInTheDocument();
    expect(screen.queryByText(RUN_HISTORY_EMPTY_NOTE)).not.toBeInTheDocument();
  });
});
