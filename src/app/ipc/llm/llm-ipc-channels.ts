import { AskAgentDto, LlmController, StopAgentDto } from "../../../modules/llm";
import type { IpcChannelMap } from "../register-ipc-channels";
import { ASK_AGENT_CHANNEL, STOP_AGENT_CHANNEL } from "../../../contracts";

/** LLM channels; the provider key is read in the main process and never crosses IPC. */
export const LLM_IPC_CHANNELS: IpcChannelMap<LlmController> = {
  [ASK_AGENT_CHANNEL]: (controller, payload) => controller.ask(Object.assign(new AskAgentDto(), payload)),
  [STOP_AGENT_CHANNEL]: (controller, payload) => controller.stop(Object.assign(new StopAgentDto(), payload)),
};
