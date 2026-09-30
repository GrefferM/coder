/** One channel's handler: controller and payload in, answer out. */
export type IpcChannelHandler<TController> = (controller: TController, payload: unknown) => Promise<unknown>;
