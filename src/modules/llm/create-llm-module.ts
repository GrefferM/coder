import { AGENT_CLIENTS } from "./constants";
import { LlmController } from "./controllers";
import { LlmService, ToolArguments } from "./services";
import type { AgentKeyStore, AgentVoice, LlmModule, ServerRunner, ToolRunner } from "./interfaces";

export function createLlmModule(
  keys: AgentKeyStore,
  voice: AgentVoice,
  tools: ToolRunner,
  servers: ServerRunner,
): LlmModule {
  const toolArguments = new ToolArguments();
  const llmService = new LlmService(keys, voice, tools, servers, toolArguments, AGENT_CLIENTS);
  const llmController = new LlmController(llmService);

  return {
    controller: llmController,
  };
}
