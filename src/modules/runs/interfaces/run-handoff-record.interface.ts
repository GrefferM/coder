/** The columns the `run_handoffs` table holds; the entity implements it. */
export interface RunHandoffRecord {
  id: string;
  place: number;
  toAgentId: string;
  stopReason: string | null;
}
