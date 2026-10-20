import type { MemorySettings } from "./memory-settings.type";

/** The memory settings of an agent, and nothing else of it. */
export function memorySettingsOf(agent: MemorySettings): MemorySettings {
  return agent.memory === "none"
    ? {
        memory: "none",
      }
    : {
        memory: agent.memory,
        compressAt: agent.compressAt,
        compressTo: agent.compressTo,
      };
}
