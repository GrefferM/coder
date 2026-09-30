import { FORGET_DELETION_CHANNEL } from "../../../../../contracts";

/** Lets a deletion's history row go, so it cannot come back twice. */
export async function forgetDeletion(id: string): Promise<void> {
  await window.electronApi.invoke(FORGET_DELETION_CHANNEL, {
    id,
  });
}
