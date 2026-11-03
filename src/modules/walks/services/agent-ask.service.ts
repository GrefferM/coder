import { agentNamed } from "../logic";
import { AGENT_ASK_NOT_TAKEN_NOTE, AGENT_ASK_NOT_TOLD_NOTE } from "../constants";
import { chatStream, chatText, walkBroke } from "../../../contracts";
import type { AgentAnswered, AgentAsked, ProjectCatalog } from "../interfaces";
import type { WalkHub } from "./walk-hub.service";

/** One question put from a command line: the project's conversation opens, the walk goes to its end, and is told. */
export class AgentAsk {
  constructor(
    private readonly hub: WalkHub,
    private readonly projects: ProjectCatalog,
  ) {}

  /** Rejects in words the person can act on where the project, the agent or the question is not to be had. */
  async run({ project, agent, question }: AgentAsked): Promise<AgentAnswered> {
    const { directory, config } = await this.projects.find(project);
    const asked = agentNamed(config.agents, agent);

    this.hub.open(directory, config);

    if (this.hub.put(asked.id, question, []) === null) {
      throw new Error(AGENT_ASK_NOT_TAKEN_NOTE);
    }

    await this.hub.whenIdle();

    const walked = this.hub.snapshot();

    if (walked === null) {
      throw new Error(AGENT_ASK_NOT_TOLD_NOTE);
    }

    return {
      text: chatText(chatStream(walked), config.agents),
      hasFallen: Object.values(walked.walks).some((walk) => walkBroke(walk)),
    };
  }
}
