/** Each field's saved value, worded as the field shows it; null where unchanged or never saved. */
export interface WasAgent {
  name: string | null;
  purpose: string | null;
  model: string | null;
  prompt: string | null;
  /** Commands and server functions are separate tab fields, each worded on its own. */
  commandTools: string | null;
  serverTools: string | null;
  agentTools: string | null;
  systemTools: string | null;
  color: string | null;
  compressAt: string | null;
  compressTo: string | null;
  maxCalls: string | null;
  temperature: string | null;
  isActive: string | null;
  waitsForAll: string | null;
  memory: string | null;
}
