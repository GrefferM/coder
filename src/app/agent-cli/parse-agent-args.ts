import { AGENT_CLI_USAGE, AGENT_CLI_USAGE_HINT } from "./agent-cli-notes.constant";
import type { AgentAsked } from "../../modules/walks";

/** The project, the agent and the question a command line carries; the question is every word after the agent. */
export function parseAgentArgs(args: string[]): AgentAsked {
  const [project = "", agent = "", ...words] = args;
  const question = words.join(" ").trim();

  if (project.trim() === "" || agent.trim() === "" || question === "") {
    throw new Error(`${AGENT_CLI_USAGE}\n${AGENT_CLI_USAGE_HINT}`);
  }

  return {
    project: project.trim(),
    agent: agent.trim(),
    question,
  };
}
