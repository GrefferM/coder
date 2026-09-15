/** What a spec hands the stand-in bridge: how a call is answered, and who hears a push. */
export interface StandInBridge<TPushed> {
  /** Answers every `invoke`; a spec that makes no call may leave it out. */
  invoke?: (channel: string, payload?: unknown) => unknown;
  /** Handed each listener the code subscribes, so the spec can keep it and push to it. */
  subscribe?: (channel: string, listener: (pushed: TPushed) => void) => (() => void) | void;
}
