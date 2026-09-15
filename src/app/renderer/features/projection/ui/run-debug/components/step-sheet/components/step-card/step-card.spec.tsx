import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StepCard } from "./step-card";
import { STEP_MONEY_FREE_LABEL, STEP_MONEY_NO_PRICES_LABEL, STEP_NOT_STARTED_LABEL } from "../../../../../../constants";
import { RUN_STEP_TOO_LONG } from "../../../../../../../record";
import { aStep } from "../../../../../../../../testing";

describe("StepCard", () => {
  it("says what the turn ran on, how long it took, what it spent and what it cost", () => {
    // Four facts on one mono line, money last.
    render(
      <StepCard
        step={aStep({
          money: 0.09,
        })}
        isBeside={false}
      />,
    );

    expect(screen.getByText(/deepseek-v4-flash/)).toBeInTheDocument();
    expect(screen.getByText(/600 ТКН/)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.09/)).toBeInTheDocument();
  });

  it("says why the dash stands, once, under the line it is about", () => {
    // The dash says a number is not there; this line says why, and it is the only place that does.
    render(
      <StepCard
        step={aStep({
          inputPrice: null,
          outputPrice: null,
          money: null,
        })}
        isBeside={false}
      />,
    );

    expect(screen.getByText(STEP_MONEY_NO_PRICES_LABEL)).toBeInTheDocument();
    expect(screen.getByText(/—/)).toBeInTheDocument();
  });

  it("says nothing about prices where they were written, however small the sum", () => {
    render(
      <StepCard
        step={aStep({
          money: 0.0001,
        })}
        isBeside={false}
      />,
    );

    expect(screen.queryByText(STEP_MONEY_NO_PRICES_LABEL)).not.toBeInTheDocument();
  });

  it("calls a price of nothing «локально» rather than leaving it to the dash", () => {
    render(
      <StepCard
        step={aStep({
          inputPrice: 0,
          outputPrice: 0,
          money: 0,
        })}
        isBeside={false}
      />,
    );

    expect(screen.getByText(new RegExp(STEP_MONEY_FREE_LABEL))).toBeInTheDocument();
    expect(screen.queryByText(STEP_MONEY_NO_PRICES_LABEL)).not.toBeInTheDocument();
  });

  it("keeps both on one line where the head has room for the card", () => {
    // In the lower sheet the card stands beside the name, so its reason goes on the same line.
    render(
      <StepCard
        step={aStep({
          inputPrice: null,
          outputPrice: null,
          money: null,
        })}
        isBeside
      />,
    );

    expect(screen.getByText(new RegExp(STEP_MONEY_NO_PRICES_LABEL))).toBeInTheDocument();
  });

  it("stands a dash for the time and true noughts for the rest where the turn never went out", () => {
    // «claude-haiku-4.5 · — · 0 ТКН · $0.00 · НЕ ПОЧИНАВСЯ» — there was no turn to take time or tokens.
    render(
      <StepCard
        step={aStep({
          state: RUN_STEP_TOO_LONG,
          inputTokens: 0,
          outputTokens: 0,
          inputPrice: null,
          outputPrice: null,
          money: null,
        })}
        isBeside={false}
      />,
    );

    expect(screen.getByText(/— · 0 ТКН · \$0\.00/)).toBeInTheDocument();
    expect(screen.getByText(STEP_NOT_STARTED_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(STEP_MONEY_NO_PRICES_LABEL)).not.toBeInTheDocument();
  });

  it("keeps the dash off a step that ran but carries the record's own zero tokens", () => {
    // A turn that went out and said nothing still took time; only a refusal has no span at all.
    render(
      <StepCard
        step={aStep({
          inputTokens: 0,
          outputTokens: 0,
          money: 0.01,
        })}
        isBeside={false}
      />,
    );

    expect(screen.queryByText(STEP_NOT_STARTED_LABEL)).not.toBeInTheDocument();
    expect(screen.getByText(/5 c/)).toBeInTheDocument();
  });
});
