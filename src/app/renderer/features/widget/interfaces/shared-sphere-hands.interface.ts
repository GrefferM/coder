/** The chat's aim in the open project, and the way to move it. */
export interface SharedSphereHands {
  directory: string;
  aimedAgentId: string | null;
  aim: (agentId: string) => void;
}
