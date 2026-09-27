import { dialog, shell } from "electron";
import { stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { ATTACHMENT_PICKER_TITLE, DIRECTORY_PICKER_TITLE, TEXT_SAVE_FILTER_LABEL, TEXT_SAVE_TITLE } from "../constants";
import { PROJECT_FILE_NAME } from "../../modules/projects/constants";
import { AttachmentPacker } from "../../modules/attachments";
import type {
  AttachmentPick,
  PackAttachmentsAsk,
  PackedAttachment,
  PickAttachmentsAsk,
  RefusedPick,
  SaveTextAsk,
} from "../../contracts";

/** Electron's own desktop calls: the choosers, the file-manager reveal, and the files a question is packed with. */
export class SystemShell {
  constructor(private readonly packer = new AttachmentPacker()) {}

  /**
   * Opens the system chooser for files or folders, and names and weighs each chosen one — nothing is read until
   * the question goes. One that would not fit in the room left under the ceiling, or cannot be read, comes back
   * refused, and takes nothing from the rest. Empty when dismissed.
   */
  async attach({ room }: PickAttachmentsAsk): Promise<AttachmentPick> {
    const result = await dialog.showOpenDialog({
      title: ATTACHMENT_PICKER_TITLE,
      properties: ["openFile", "openDirectory", "multiSelections"],
    });
    const pick: AttachmentPick = {
      picked: [],
      refused: [],
    };

    if (result.canceled) {
      return pick;
    }

    // Each chosen one is counted on its own, against what the ones before it left of the room.
    let left = room;

    for (const chosen of result.filePaths) {
      try {
        const picked = await this.packer.measure(chosen, left);

        if (picked === null) {
          pick.refused.push(await this.refusalOf(chosen, "tooBig", null));

          continue;
        }

        pick.picked.push(picked);
        left = left === null ? null : left - picked.least;
      } catch (error) {
        pick.refused.push(await this.refusalOf(chosen, "unread", error));
      }
    }

    return pick;
  }

  /** Packs a question's picked files and folders as it goes, reading no further than the model's ceiling allows. */
  async pack({ paths, ceiling }: PackAttachmentsAsk): Promise<PackedAttachment[]> {
    return this.packer.packAll(paths, ceiling);
  }

  /** Opens the system's folder chooser. */
  async choose(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: DIRECTORY_PICKER_TITLE,
      properties: ["openDirectory", "createDirectory"],
    });

    if (result.canceled) {
      return null;
    }

    const [directory] = result.filePaths;

    return directory ?? null;
  }

  /** Reveals a project's config file in the system's file manager, with the project's folder open around it. */
  async revealProject(directory: string): Promise<void> {
    shell.showItemInFolder(path.join(directory, PROJECT_FILE_NAME));
  }

  /**
   * Opens the system's save chooser on a suggested name, and writes the text where the person points it. Null
   * when the chooser is dismissed — nothing is written, and the caller says nothing happened.
   */
  async saveText({ text, suggestedName }: SaveTextAsk): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      title: TEXT_SAVE_TITLE,
      defaultPath: suggestedName,
      filters: [
        {
          name: TEXT_SAVE_FILTER_LABEL,
          extensions: ["txt"],
        },
      ],
    });

    if (result.canceled || result.filePath === undefined) {
      return null;
    }

    await writeFile(result.filePath, text, "utf8");

    return result.filePath;
  }

  /** A chosen file or folder that is not attached: too big for the room, or not ours to read, with the system's words. */
  private async refusalOf(chosen: string, reason: RefusedPick["reason"], error: unknown): Promise<RefusedPick> {
    const { code } = typeof error === "object" && error !== null ? <{ code?: unknown }>error : {};
    let kind: RefusedPick["kind"] = null;

    try {
      kind = (await stat(chosen)).isDirectory() ? "folder" : "file";
    } catch {
      // Gone, or not even there to be looked at: the name alone is said.
    }

    const said = error instanceof Error ? error.message : String(error);

    return {
      path: chosen,
      name: path.basename(chosen),
      kind,
      reason,
      code: typeof code === "string" ? code : null,
      message: reason === "unread" ? said : null,
    };
  }
}
