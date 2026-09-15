/** One channel's handler: the domain's controller and the renderer's payload in, the renderer's answer out. */
export type IpcChannelHandler<TController> = (controller: TController, payload: unknown) => Promise<unknown>;
