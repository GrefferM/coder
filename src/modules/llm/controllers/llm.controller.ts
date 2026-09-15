import { Validate } from "../../../utils/dto-validation";
import { LlmService } from "../services";
import { AskAgentDto, StopAgentDto } from "../dto";
import type { AgentAnswer } from "../interfaces";

/** The entry point to one turn of an agent's chat, and to ending one that is still out. */
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Validate()
  async ask(payload: AskAgentDto): Promise<AgentAnswer> {
    return this.llmService.ask(payload);
  }

  @Validate()
  async stop(payload: StopAgentDto): Promise<void> {
    this.llmService.stop(payload);
  }
}
