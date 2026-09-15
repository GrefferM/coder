import type { IpcChannelHandler } from "./ipc-channel-handler.interface";

/** Every channel a domain exposes, keyed by channel name, each handler bound to that domain's controller. */
export type IpcChannelMap<TController> = Record<string, IpcChannelHandler<TController>>;
