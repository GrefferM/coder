import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NotStartedCard } from "./not-started-card";
import {
  NOT_STARTED_ENDS,
  NOT_STARTED_DRAFT_NOTE,
  NOT_STARTED_FREE_LABEL,
  NOT_STARTED_TITLE,
  OVER_CEILING_CEILING_LABEL,
  OVER_CEILING_MEMORY_LABEL,
  OVER_CEILING_NO_RETRY_NOTE,
  OVER_CEILING_TOTAL_LABEL,
} from "../../../../constants";

const wouldGo = {
  prompt: 1900,
  asked: 210500,
  memory: 4000,
  total: 216400,
  ceiling: 200000,
};

describe("NotStartedCard", () => {
  it("heads every reason the same way and says nothing was spent", () => {
    render(
      <NotStartedCard
        reason="noKey"
        note="Провайдер цієї моделі не має ключа."
        wouldGo={null}
        isAsked={false}
        onAct={vi.fn()}
      />,
    );

    // One shared heading, plus the reason's word from the sphere's pill.
    expect(screen.getByText(NOT_STARTED_TITLE)).toBeInTheDocument();
    expect(screen.getByText(NOT_STARTED_ENDS.noKey.label ?? "")).toBeInTheDocument();
    expect(screen.getByText("Провайдер цієї моделі не має ключа.")).toBeInTheDocument();
    expect(screen.getByText(NOT_STARTED_FREE_LABEL)).toBeInTheDocument();
  });

  it("offers the one act that can help, in the words the reason gives it", async () => {
    const onAct = vi.fn();

    render(
      <NotStartedCard
        reason="silent"
        note="Локальний провайдер не відповідає."
        wouldGo={null}
        isAsked={false}
        onAct={onAct}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: NOT_STARTED_ENDS.silent.actLabel,
      }),
    );

    expect(onAct).toHaveBeenCalled();
  });

  it("offers nothing where there is nothing to do from here", () => {
    render(
      <NotStartedCard
        reason="silent"
        note="Локальний провайдер не відповідає."
        wouldGo={null}
        isAsked={false}
        onAct={null}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("says the words came back to the field, where the person was the one who asked", () => {
    render(<NotStartedCard reason="noKey" note="Нема ключа." wouldGo={null} isAsked onAct={vi.fn()} />);

    expect(screen.getByText(NOT_STARTED_DRAFT_NOTE)).toBeInTheDocument();
  });

  it("says nothing about a field for a turn that came down a line, where there is none", () => {
    render(<NotStartedCard reason="noKey" note="Нема ключа." wouldGo={null} isAsked={false} onAct={vi.fn()} />);

    expect(screen.queryByText(NOT_STARTED_DRAFT_NOTE)).not.toBeInTheDocument();
  });

  it("shows what would have gone, part by part, against the model's own number", () => {
    render(
      <NotStartedCard
        reason="tooLong"
        note="У модель пішло б 216 400 символів."
        wouldGo={wouldGo}
        isAsked={false}
        onAct={vi.fn()}
      />,
    );

    // The parts that would have gone, their sum and the ceiling.
    expect(screen.getByText("1 900")).toBeInTheDocument();
    expect(screen.getByText("210 500")).toBeInTheDocument();
    expect(screen.getByText(OVER_CEILING_MEMORY_LABEL)).toBeInTheDocument();
    expect(screen.getByText("4 000")).toBeInTheDocument();
    expect(screen.getByText(OVER_CEILING_TOTAL_LABEL)).toBeInTheDocument();
    expect(screen.getByText("216 400")).toBeInTheDocument();
    expect(screen.getByText(OVER_CEILING_CEILING_LABEL)).toBeInTheDocument();
    // What we counted is grouped, the person's own number is not.
    expect(screen.getByText("200000")).toBeInTheDocument();
    expect(screen.getByText(OVER_CEILING_NO_RETRY_NOTE)).toBeInTheDocument();
  });

  it("keeps the five that had nothing to send free of a breakdown", () => {
    render(<NotStartedCard reason="noKey" note="Нема ключа." wouldGo={null} isAsked={false} onAct={vi.fn()} />);

    expect(screen.queryByText(OVER_CEILING_TOTAL_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByText(OVER_CEILING_NO_RETRY_NOTE)).not.toBeInTheDocument();
  });

  it("draws a turn without consent as the frame does, with no word of its own beside the heading", () => {
    render(
      <NotStartedCard
        reason="noConsent"
        note="exa-mcp ще не запускали на цій машині — його рядок запуску чекає вашої згоди."
        wouldGo={null}
        isAsked={false}
        onAct={vi.fn()}
      />,
    );

    expect(screen.getByText(NOT_STARTED_TITLE)).toBeInTheDocument();
    expect(screen.getByText("ПОКАЗАТИ, ЩО ЗАПУСТИТЬСЯ")).toBeInTheDocument();
    expect(screen.getByText(NOT_STARTED_FREE_LABEL)).toBeInTheDocument();
  });
});
