import { REMEMBER_DELETION_CHANNEL } from "../../../../../contracts";
import type { TakenThings } from "../interfaces";

/** Writes a deletion into the project's history and returns the id of its row. */
export async function rememberDeletion(
  directory: string,
  kind: string,
  name: string,
  taken: TakenThings,
): Promise<string> {
  return window.electronApi.invoke(REMEMBER_DELETION_CHANNEL, {
    directory,
    kind,
    name,
    taken,
  });
}
