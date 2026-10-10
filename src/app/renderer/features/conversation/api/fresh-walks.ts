import { FRESH_WALKS_CHANNEL } from "../../../../../contracts";

/** «+ НОВИЙ ЧАТ»: the conversation is emptied, and walks still out keep writing into their record. */
export async function freshWalks(): Promise<void> {
  return window.electronApi.invoke(FRESH_WALKS_CHANNEL);
}
