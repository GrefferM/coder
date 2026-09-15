import type { Answer, Channel, Payload, Push, Pushed } from "../../../contracts";

/**
 * The bridge every renderer call to the main process goes through. The channel decides what it is handed and what
 * comes back (`src/contracts`), so no caller says which type it expects — and none can say a wrong one.
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
