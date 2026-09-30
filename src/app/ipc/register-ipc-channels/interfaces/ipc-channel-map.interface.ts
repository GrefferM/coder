import type { IpcChannelHandler } from "./ipc-channel-handler.interface";

/** A domain's channels keyed by name, each handler bound to its controller. */
export type IpcChannelMap<TController> = Record<string, IpcChannelHandler<TController>>;
