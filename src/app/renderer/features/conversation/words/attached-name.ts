import { ATTACH_FOLDER_NAME_SUFFIX } from "../constants";
import type { AttachmentKind } from "../../../interfaces";

/** An attachment as it is named anywhere it is said — a folder with its trailing slash, a file as it is. */
export function attachedName(name: string, kind: AttachmentKind | null): string {
  return kind === "folder" ? `${name}${ATTACH_FOLDER_NAME_SUFFIX}` : name;
}
