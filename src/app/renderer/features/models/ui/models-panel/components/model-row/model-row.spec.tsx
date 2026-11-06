import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModelRow } from "./model-row";
import { MODEL_HEARD_LABEL, MODEL_KIND_NAMES, MODEL_NOT_HEARD_LABEL } from "../../../../constants";
import { MODEL_ROW_DELETE_LABEL, MODEL_ROW_EDIT_LABEL, MODEL_ROW_META_SEPARATOR } from "./constants";
import { NOT_INSTALLED_SUFFIX } from "../../constants";
import { LOST_PROVIDER_SUFFIX } from "../../../../../../constants";
import { modelNumbers } from "../../../../../../logic";
import { agentsCountLabel, notFilledLabel } from "../../../../../../words";
import type { Agent, ProjectModel } from "../../../../../../interfaces";
import { aModel, anAgent } from "../../../../../../testing";

function model(patch: Partial<ProjectModel> = {}): ProjectModel {
  return aModel({
    title: "deepseek/deepseek-v4-flash-0731",
    ...patch,
  });
}

const seeker: Agent = anAgent({
  x: 0,
  y: 0,
});

function acts() {
  return {
    onOpen: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };
}

describe("ModelRow", () => {
  it("closed, names the model with its prices and how many agents stand on it", () => {
    render(
      <ModelRow
        isHeard={false}
        model={model()}
        agents={[seeker]}
        isProviderKnown
        isInstalled
        isOpen={false}
        {...acts()}
      />,
    );

    expect(screen.getByText("deepseek/deepseek-v4-flash-0731")).toBeInTheDocument();
    expect(
      screen.getByText(`$3.00${MODEL_ROW_META_SEPARATOR}`, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(agentsCountLabel(1), {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("says in the prices' own place which field an unfinished model is missing", () => {
    // A model with an unwritten number is not priced at 0; it says what is missing.
    const unfinished = model({
      inputPrice: null,
    });

    render(
      <ModelRow
        isHeard={false}
        model={unfinished}
        agents={[]}
        isProviderKnown
        isInstalled
        isOpen={false}
        {...acts()}
      />,
    );

    expect(
      screen.getByText(notFilledLabel(modelNumbers(unfinished)) ?? "", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("says a provider this build does not know, and one that no longer holds the model", () => {
    // Both wrongs read the same: what was named is not there to ask.
    const { rerender } = render(
      <ModelRow
        isHeard={false}
        model={model()}
        agents={[]}
        isProviderKnown={false}
        isInstalled={null}
        isOpen
        {...acts()}
      />,
    );

    expect(
      screen.getByText(LOST_PROVIDER_SUFFIX, {
        exact: false,
      }),
    ).toBeInTheDocument();

    rerender(
      <ModelRow isHeard={false} model={model()} agents={[]} isProviderKnown isInstalled={false} isOpen {...acts()} />,
    );

    expect(
      screen.getByText(NOT_INSTALLED_SUFFIX, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("says nothing of the machine where nobody has asked it yet", () => {
    render(
      <ModelRow isHeard={false} model={model()} agents={[]} isProviderKnown isInstalled={null} isOpen {...acts()} />,
    );

    expect(
      screen.queryByText(NOT_INSTALLED_SUFFIX, {
        exact: false,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(LOST_PROVIDER_SUFFIX, {
        exact: false,
      }),
    ).not.toBeInTheDocument();
  });

  it("keeps the two acts for the open row", async () => {
    const said = acts();
    const { rerender } = render(
      <ModelRow isHeard={false} model={model()} agents={[]} isProviderKnown isInstalled isOpen={false} {...said} />,
    );

    expect(screen.queryByText(MODEL_ROW_EDIT_LABEL)).not.toBeInTheDocument();

    rerender(<ModelRow isHeard={false} model={model()} agents={[]} isProviderKnown isInstalled isOpen {...said} />);
    await userEvent.click(screen.getByText(MODEL_ROW_EDIT_LABEL));

    expect(said.onEdit).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByText(MODEL_ROW_DELETE_LABEL));

    expect(said.onDelete).toHaveBeenCalledOnce();
  });

  it("says to a reader whether it stands open", () => {
    const { rerender } = render(
      <ModelRow isHeard={false} model={model()} agents={[]} isProviderKnown isInstalled isOpen={false} {...acts()} />,
    );

    expect(screen.getByText(model().title).closest("[aria-expanded]")).toHaveAttribute("aria-expanded", "false");

    rerender(<ModelRow isHeard={false} model={model()} agents={[]} isProviderKnown isInstalled isOpen {...acts()} />);

    expect(screen.getByText(model().title).closest("[aria-expanded]")).toHaveAttribute("aria-expanded", "true");
  });

  it("names the model's kind after its name", () => {
    render(
      <ModelRow isHeard={false} model={model()} agents={[]} isProviderKnown isInstalled isOpen={false} {...acts()} />,
    );

    expect(
      screen.getByText(MODEL_KIND_NAMES.text, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("says of a recognition model whether speech hears with it, not its prices", () => {
    const whisper = model({
      kind: "listen",
      inputPrice: null,
      outputPrice: null,
      contextCeiling: null,
      answerCeiling: null,
    });
    const { rerender } = render(
      <ModelRow isHeard model={whisper} agents={[]} isProviderKnown isInstalled isOpen={false} {...acts()} />,
    );

    expect(
      screen.getByText(MODEL_KIND_NAMES.listen, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(MODEL_HEARD_LABEL)).toBeInTheDocument();

    rerender(
      <ModelRow isHeard={false} model={whisper} agents={[]} isProviderKnown isInstalled isOpen={false} {...acts()} />,
    );

    expect(screen.getByText(MODEL_NOT_HEARD_LABEL)).toBeInTheDocument();
  });
});
