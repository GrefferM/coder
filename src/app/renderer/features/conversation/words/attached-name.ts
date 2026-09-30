import { ATTACH_FOLDER_NAME_SUFFIX } from "../constants";
import type { AttachmentKind } from "../../../interfaces";

/** An attachment's name: a folder with a trailing slash, a file as is. */
export function attachedName(name: string, kind: AttachmentKind | null): string {
  return kind === "folder" ? `${name}${ATTACH_FOLDER_NAME_SUFFIX}` : name;
}
