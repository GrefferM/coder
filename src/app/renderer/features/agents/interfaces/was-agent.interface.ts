/**
 * What each field was before this draft changed it, worded as the field shows it; null where unchanged or nothing is
 * saved yet.
 */
export interface WasAgent {
  name: string | null;
  purpose: string | null;
  model: string | null;
  prompt: string | null;
  /** Commands and server functions are separate tab fields, each worded on its own. */
  commandTools: string | null;
  serverTools: string | null;
  /** Agents granted as tools, a field of their own. */
  agentTools: string | null;
  color: string | null;
  maxCalls: string | null;
  temperature: string | null;
  isActive: string | null;
  waitsForAll: string | null;
  memory: string | null;
}
