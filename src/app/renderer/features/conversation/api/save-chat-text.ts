import { SAVE_TEXT_FILE_CHANNEL } from "../../../../../contracts";

/** Has the person choose where the transcript goes, and writes it there. The saved path, or null when dismissed. */
export async function saveChatText(text: string, suggestedName: string): Promise<string | null> {
  return window.electronApi.invoke(SAVE_TEXT_FILE_CHANNEL, {
    text,
    suggestedName,
  });
}
