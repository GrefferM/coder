import type { StandInBridge } from "./interfaces";

/**
 * Puts a stand-in bridge on the window for one spec. Both halves of the real one are typed by the channel, so a spec
 * answering them by hand can never line up with either; this is the one place that says so, instead of every spec
 * casting through `unknown` on its own.
 */
export function standInBridge<TPushed = never>(bridge: StandInBridge<TPushed> = {}): void {
  const { invoke = () => undefined, subscribe = () => undefined } = bridge;

  window.electronApi = <Window["electronApi"]>(<unknown>{
    invoke,
    subscribe: (channel: string, listener: (pushed: TPushed) => void) =>
      subscribe(channel, listener) ?? (() => undefined),
  });
}
