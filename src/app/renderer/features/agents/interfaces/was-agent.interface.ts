/**
 * What each of the agent's fields was before this draft changed it, said in the words the field itself
 * shows. Null where the field stands as it was saved — and everything is null while nothing is saved yet.
 */
export interface WasAgent {
  name: string | null;
  purpose: string | null;
  model: string | null;
  prompt: string | null;
  /**
   * The commands and the server's functions are two fields on the tab, so each says what it was on its own —
   * one word for both would show every server's function under «КОМАНДИ» and every command under «MCP».
   */
  commandTools: string | null;
  serverTools: string | null;
  /** The agents granted as tools are a third field of their own, said apart from commands and servers. */
  agentTools: string | null;
  color: string | null;
  maxCalls: string | null;
  temperature: string | null;
  isActive: string | null;
  waitsForAll: string | null;
}
