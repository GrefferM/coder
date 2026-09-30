/** Columns of `run_handoffs`; the entity implements it. */
export interface RunHandoffRecord {
  id: string;
  place: number;
  toAgentId: string;
  stopReason: string | null;
}
