/** The shape `ipcMain.handle` takes. */
export type IpcHandleFn = (channel: string, listener: (...args: unknown[]) => Promise<unknown> | unknown) => void;
