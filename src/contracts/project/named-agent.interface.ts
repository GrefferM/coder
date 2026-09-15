/**
 * An agent as anything that only draws one needs it: who it is, what it is called, what colour it wears. A record
 * keeps this much of an agent that walked, so a conversation read back can name it after the project has let it go.
 */
export interface NamedAgent {
  id: string;
  name: string;
  color: string;
}
