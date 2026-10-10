import { AGENT_CLIENTS } from "./constants";
import { LlmController } from "./controllers";
import { LlmService, ToolArguments } from "./services";
import type { AgentKeyStore, AgentVoice, LlmModule, RunMemory, ServerRunner, ToolRunner } from "./interfaces";

export function createLlmModule(
  keys: AgentKeyStore,
  voice: AgentVoice,
  tools: ToolRunner,
  servers: ServerRunner,
  memory: RunMemory,
): LlmModule {
  const toolArguments = new ToolArguments();
  const llmService = new LlmService(keys, voice, tools, servers, memory, toolArguments, AGENT_CLIENTS);
  const llmController = new LlmController(llmService);

  return {
    controller: llmController,
    service: llmService,
  };
}
