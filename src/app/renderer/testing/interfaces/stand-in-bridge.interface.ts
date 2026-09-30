/** What a spec gives the stand-in bridge: how calls are answered and who hears a push. */
export interface StandInBridge<TPushed> {
  /** Answers every `invoke`; optional for a spec that makes no call. */
  invoke?: (channel: string, payload?: unknown) => unknown;
  /** Receives each subscribed listener so the spec can push to it. */
  subscribe?: (channel: string, listener: (pushed: TPushed) => void) => (() => void) | void;
}
