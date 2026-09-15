import type { PendingPlacement } from "../../../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** The agent under the hand — the one selected, the one being placed, the one asked about. */
export interface AgentSelection {
  selectedAgentId: string | null;
  /** Selects a copy just put down and drops any claim standing. */
  takePut: (agentId: string) => void;
  pending: PendingPlacement | null;
  doomedAgentId: string | null;
  select: (agentId: string | null) => void;
  claimPoint: (at: Point) => void;
  claimCentre: () => void;
  createAgent: (name: string, modelId: string) => Promise<void>;
  requestDelete: (agentId: string) => void;
  confirmDelete: () => void;
  dismissDelete: () => void;
  reset: () => void;
}
