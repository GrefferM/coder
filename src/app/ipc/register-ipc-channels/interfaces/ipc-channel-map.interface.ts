import type { IpcChannelHandler } from "./ipc-channel-handler.interface";

export type IpcChannelMap<TController> = Record<string, IpcChannelHandler<TController>>;
