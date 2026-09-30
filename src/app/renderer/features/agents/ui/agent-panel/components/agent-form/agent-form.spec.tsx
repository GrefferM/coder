import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentForm } from "./agent-form";
import {
  AGENT_FORM_CANCEL_LABEL,
  AGENT_FORM_CREATE_LABEL,
  AGENT_FORM_NAME_LABEL,
  AGENT_FORM_NO_MODELS_NOTE,
  AGENT_FORM_TITLE,
} from "./constants";
import { MODEL_PICKER_PLACEHOLDER } from "../model-picker/constants";
import type { ProjectModel } from "../../../../../../interfaces";
import { aModel } from "../../../../../../testing";

const flash: ProjectModel = aModel({});

describe("AgentForm", () => {
  it("asks for the two things an agent cannot stand without", () => {
    render(<AgentForm models={[flash]} agents={[]} onCreate={async () => {}} onCancel={() => {}} />);

    expect(screen.getByText(AGENT_FORM_TITLE)).toBeInTheDocument();
    expect(screen.getByLabelText(AGENT_FORM_NAME_LABEL)).toBeInTheDocument();
  });

  it("writes nothing while either is missing, and marks the one that is", async () => {
    // A nameless or model-less agent is not written.
    const onCreate = vi.fn();

    render(<AgentForm models={[flash]} agents={[]} onCreate={onCreate} onCancel={() => {}} />);
    await userEvent.click(screen.getByText(AGENT_FORM_CREATE_LABEL));

    expect(onCreate).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(AGENT_FORM_NAME_LABEL), "Шукач");
    await userEvent.click(screen.getByText(AGENT_FORM_CREATE_LABEL));

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("writes the agent once both are given, and empties itself after", async () => {
    const onCreate = vi.fn(async () => {});

    render(<AgentForm models={[flash]} agents={[]} onCreate={onCreate} onCancel={() => {}} />);
    await userEvent.type(screen.getByLabelText(AGENT_FORM_NAME_LABEL), "Шукач");
    await userEvent.click(screen.getByText(MODEL_PICKER_PLACEHOLDER));
    await userEvent.click(screen.getByText("deepseek-v4-flash"));
    await userEvent.click(screen.getByText(AGENT_FORM_CREATE_LABEL));

    expect(onCreate).toHaveBeenCalledWith("Шукач", "model-1");
    expect(screen.getByLabelText(AGENT_FORM_NAME_LABEL)).toHaveValue("");
  });

  it("says where to go where the project has no model to stand on", () => {
    render(<AgentForm models={[]} agents={[]} onCreate={async () => {}} onCancel={() => {}} />);

    expect(screen.getByText(AGENT_FORM_NO_MODELS_NOTE)).toBeInTheDocument();
  });

  it("shows what went wrong where the write refused, instead of failing in silence", async () => {
    render(
      <AgentForm
        models={[flash]}
        agents={[]}
        onCreate={() => Promise.reject(new Error("Не вдалося записати файл проєкту"))}
        onCancel={() => {}}
      />,
    );
    await userEvent.type(screen.getByLabelText(AGENT_FORM_NAME_LABEL), "Шукач");
    await userEvent.click(screen.getByText(MODEL_PICKER_PLACEHOLDER));
    await userEvent.click(screen.getByText("deepseek-v4-flash"));
    await userEvent.click(screen.getByText(AGENT_FORM_CREATE_LABEL));

    expect(await screen.findByText("Не вдалося записати файл проєкту")).toBeInTheDocument();
    // A refused write keeps what was typed.
    expect(screen.getByLabelText(AGENT_FORM_NAME_LABEL)).toHaveValue("Шукач");
  });

  it("goes back without writing anything", async () => {
    const onCancel = vi.fn();
    const onCreate = vi.fn();

    render(<AgentForm models={[flash]} agents={[]} onCreate={onCreate} onCancel={onCancel} />);
    await userEvent.click(screen.getByText(AGENT_FORM_CANCEL_LABEL));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
