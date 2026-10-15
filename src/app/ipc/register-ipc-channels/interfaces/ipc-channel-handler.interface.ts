export type IpcChannelHandler<TController> = (controller: TController, payload: unknown) => Promise<unknown>;
