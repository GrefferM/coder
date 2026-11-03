import { agentTrouble } from "./agent-trouble";
import { modelInstalled } from "../../models";
import { modelStands } from "../../../logic";
import {
  STATE_LIVE_COLOR,
  STATE_MODEL_MISSING_LABEL,
  STATE_OFF_COLOR,
  STATE_OFF_LABEL,
  STATE_PROVIDER_SILENT_LABEL,
  STATE_READY_LABEL,
  STATE_FELL_LABEL,
  STATE_STOP_COLOR,
  STATE_WAITING_COLOR,
  STATE_WAITING_LABEL,
  STATE_WONT_START_LABEL,
  STATE_WORKING_LABEL,
} from "../constants";
import type { Agent } from "../../../interfaces";
import type { AgentState, StateFacts } from "../interfaces";

/** State by priority: working, waiting, off, break, provider, lost model, fall, «готовий». */
export function agentState(agent: Agent, facts: StateFacts): AgentState {
  const { config, providers, answers, looks } = facts;
  // Working and waiting are matched by agent id.
  const fellAt = facts.fellAt[agent.id] ?? null;

  if (facts.working.some((one) => one.agentId === agent.id)) {
    return {
      label: STATE_WORKING_LABEL,
      color: STATE_LIVE_COLOR,
      mark: "clock",
      at: null,
    };
  }

  // Alive but not working: a grey dot.
  if (facts.waiting.some((one) => one.agentId === agent.id)) {
    return {
      label: STATE_WAITING_LABEL,
      color: STATE_WAITING_COLOR,
      mark: "dot",
      at: null,
    };
  }

  if (!agent.isActive) {
    return {
      label: STATE_OFF_LABEL,
      color: STATE_OFF_COLOR,
      mark: "dot",
      at: null,
    };
  }

  if (agentTrouble(agent, config, providers, looks)?.isBreak === true) {
    return {
      label: STATE_WONT_START_LABEL,
      color: STATE_STOP_COLOR,
      mark: "sign",
      at: null,
    };
  }

  const { model } = modelStands(agent.modelId, config.models, providers);
  const answer = model === null ? undefined : answers[model.provider];

  if (answer !== undefined && !answer.isAnswering) {
    return {
      label: STATE_PROVIDER_SILENT_LABEL,
      color: STATE_STOP_COLOR,
      mark: "dot",
      at: answer.askedAt,
    };
  }

  if (model !== null && modelInstalled(model, providers, answers) === false) {
    return {
      label: STATE_MODEL_MISSING_LABEL,
      color: STATE_STOP_COLOR,
      mark: "dot",
      at: answer?.askedAt ?? null,
    };
  }

  if (fellAt !== null) {
    return {
      label: STATE_FELL_LABEL,
      color: STATE_STOP_COLOR,
      mark: "dot",
      at: new Date(fellAt),
    };
  }

  return {
    label: STATE_READY_LABEL,
    color: STATE_LIVE_COLOR,
    mark: "dot",
    at: null,
  };
}
