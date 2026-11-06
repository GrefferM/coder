import { dialog, shell } from "electron";
import { stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ATTACHMENT_PICKER_TITLE,
  DIRECTORY_PICKER_TITLE,
  MICROPHONE_SETTINGS_PAGES,
  TEXT_SAVE_FILTER_LABEL,
  TEXT_SAVE_TITLE,
} from "../constants";
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

/** Electron's desktop calls: choosers, file-manager reveal, packing a question's files, and the microphone's page. */
export class SystemShell {
  constructor(private readonly packer = new AttachmentPacker()) {}

  /**
   * Opens the system chooser and names and weighs each chosen file or folder without reading it. One that does not fit
   * the room left under the ceiling, or cannot be read, comes back refused without affecting the rest. Empty when
   * dismissed.
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

    // Each pick is counted against what the earlier ones left of the room.
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

  /** Packs a question's picked files and folders, reading no further than the model's ceiling allows. */
  async pack({ paths, ceiling }: PackAttachmentsAsk): Promise<PackedAttachment[]> {
    return this.packer.packAll(paths, ceiling);
  }

  /** `null` when the chooser is dismissed. */
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

  /** Reveals a project's config file in the file manager, with the project's folder open around it. */
  async revealProject(directory: string): Promise<void> {
    shell.showItemInFolder(path.join(directory, PROJECT_FILE_NAME));
  }

  /** Opens the system's page of who may use the microphone; a platform without one opens nothing. */
  async openMicrophoneSettings(): Promise<void> {
    const page = MICROPHONE_SETTINGS_PAGES[process.platform];

    if (page === undefined) {
      return;
    }

    await shell.openExternal(page);
  }

  /**
   * Opens the save chooser on a suggested name and writes the text there. `null` when dismissed, with nothing written.
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

  /** A chosen file or folder that is not attached (too big for the room, or unreadable), with the system's words. */
  private async refusalOf(chosen: string, reason: RefusedPick["reason"], error: unknown): Promise<RefusedPick> {
    const { code } = typeof error === "object" && error !== null ? <{ code?: unknown }>error : {};
    let kind: RefusedPick["kind"] = null;

    try {
      kind = (await stat(chosen)).isDirectory() ? "folder" : "file";
    } catch {
      // Gone or not inspectable: only the name is given.
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
