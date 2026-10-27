export interface RunHandoffRecord {
  id: string;
  place: number;
  toAgentId: string;
  stopReason: string | null;
  text: string;
}
