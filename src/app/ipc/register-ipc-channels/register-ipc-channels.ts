import { ipcMain } from "electron";
import { Refusal } from "../../../utils/refusals";
import { IPC_FAILURE_PREFIX } from "./constants";
import type { IpcAnswer, IpcChannelMap, IpcHandleFn } from "./interfaces";

/** Registers every channel in `channelMap` against `handle`; a channel answers with a value and never rejects. */
export function registerIpcChannels<TController>(
  controller: TController,
  channelMap: IpcChannelMap<TController>,
  handle: IpcHandleFn = (channel, listener) => ipcMain.handle(channel, listener),
): void {
  Object.entries(channelMap).forEach(([channel, handler]) => {
    handle(channel, async (_event: unknown, payload: unknown): Promise<IpcAnswer> => {
      try {
        return {
          value: await handler(controller, payload),
          refusal: null,
          failure: null,
        };
      } catch (thrown) {
        return answerOf(channel, thrown);
      }
    });
  });
}

/** A Refusal goes back as `refusal`; anything else is logged and goes back as `failure`. */
function answerOf(channel: string, thrown: unknown): IpcAnswer {
  if (thrown instanceof Refusal) {
    return {
      value: null,
      // The whole message, not only the code: the refusal's detail follows the code.
      refusal: thrown.message,
      failure: null,
    };
  }

  /** The stack only: a library's error carries the provider's headers and cookies. */
  console.error(`${IPC_FAILURE_PREFIX}${channel}`, thrown instanceof Error ? thrown.stack : String(thrown));

  return {
    value: null,
    refusal: null,
    failure: thrown instanceof Error ? thrown.message : String(thrown),
  };
}
