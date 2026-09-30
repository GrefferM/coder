import type { Answer, Channel, Payload, Push, Pushed } from "../../../contracts";

/**
 * The bridge for every renderer call to the main process; the channel fixes the payload and result types
 * (`src/contracts`).
 */
interface ElectronApi {
  invoke: <C extends Channel>(
    channel: C,
    ...payload: Payload<C> extends void ? [] : [Payload<C>]
  ) => Promise<Answer<C>>;
  subscribe: <P extends Push>(channel: P, listener: (payload: Pushed<P>) => void) => () => void;
}

declare global {
  interface Window {
    electronApi: ElectronApi;
  }
}

export {};
