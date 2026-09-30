import type { StandInBridge } from "./interfaces";

/**
 * Installs a stand-in bridge on the window for one spec; the real bridge's channel types cannot be matched by hand, so
 * the cast lives here.
 */
export function standInBridge<TPushed = never>(bridge: StandInBridge<TPushed> = {}): void {
  const { invoke = () => undefined, subscribe = () => undefined } = bridge;

  window.electronApi = <Window["electronApi"]>(<unknown>{
    invoke,
    subscribe: (channel: string, listener: (pushed: TPushed) => void) =>
      subscribe(channel, listener) ?? (() => undefined),
  });
}
