import { PACK_ATTACHMENTS_CHANNEL } from "../../../../../contracts";
import type { PackedAttachment } from "../../../../../contracts";

/** Packs a question's picked files and folders, reading no further than the ceiling allows. */
export async function packAttachments(paths: string[], ceiling: number): Promise<PackedAttachment[]> {
  return window.electronApi.invoke(PACK_ATTACHMENTS_CHANNEL, {
    paths,
    ceiling,
  });
}
