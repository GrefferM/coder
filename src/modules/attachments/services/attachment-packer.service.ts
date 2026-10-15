import { access, constants, open, readdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  ATTACHMENT_BINARY_SNIFF_BYTES,
  ATTACHMENT_BINARY_TAG,
  ATTACHMENT_DENIED_TAG,
  ATTACHMENT_FILE_RULE,
  ATTACHMENT_HEADER_PREFIX,
  ATTACHMENT_HEADER_SUFFIX,
  ATTACHMENT_HIGH_SURROGATE_FIRST,
  ATTACHMENT_HIGH_SURROGATE_LAST,
  ATTACHMENT_LOW_SURROGATE_FIRST,
  ATTACHMENT_LOW_SURROGATE_LAST,
  ATTACHMENT_MOST_BYTES_PER_CHARACTER,
  ATTACHMENT_STAT_BATCH,
  ATTACHMENT_TREE_INDENT,
  ATTACHMENT_TREE_LABEL,
} from "../constants";
import { ATTACHMENT_DENIED_CODES } from "../../../contracts";
import type { PackedAttachment, PickedAttachment } from "../interfaces";

/** `text` is base64 when `isBinary`. */
interface FileContent {
  text: string;
  isBinary: boolean;
}

/** One path under a folder: a file, or a folder the system would not open. */
interface WalkedEntry {
  rel: string;
  isDenied: boolean;
}

/** What is left of the ceiling while one question's attachments are packed, shared by all of them. */
interface PackBudget {
  left: number;
}

interface PackWriting {
  parts: string[];
  budget: PackBudget;
}

/**
 * Picks and packs files and folders for a question. A pick only names and weighs; the pack is written when the question
 * goes: a folder becomes a tree of paths then each file under its path, non-text files as base64, unreadable paths
 * marked in place. It reads no further than the model's ceiling needs.
 */
export class AttachmentPacker {
  /**
   * A picked file or folder, named and weighed, with the fewest characters its pack can come to. Given a room under the
   * ceiling, counting stops with null as soon as that least exceeds it.
   */
  async measure(target: string, room: number | null = null): Promise<PickedAttachment | null> {
    const bound = room ?? Number.POSITIVE_INFINITY;
    const name = path.basename(target);
    const found = await stat(target);

    if (!found.isDirectory()) {
      const least =
        characters(`${this.header(name)}\n\n`) +
        characters(this.ruleLine(name, "")) +
        Math.ceil(found.size / ATTACHMENT_MOST_BYTES_PER_CHARACTER) +
        1;

      return least > bound
        ? null
        : {
            path: target,
            name,
            kind: "file",
            bytes: found.size,
            least,
          };
    }

    // The whole tree, then every file under its rule; the tail «\n\n» and «\n» are counted.
    let least = characters(`${this.header(name)}\n\n${ATTACHMENT_TREE_LABEL}\n`) + 2 + 1;
    let lines = 0;
    const files: string[] = [];
    const isWalked = await this.walk(target, "", (entry) => {
      least += characters(this.treeLine(entry, lines));
      lines += 1;

      if (!entry.isDenied) {
        least += (files.length === 0 ? 0 : 2) + characters(this.ruleLine(entry.rel, ""));
        files.push(entry.rel);
      }

      return least <= bound;
    });

    if (!isWalked) {
      return null;
    }

    let bytes = 0;

    for (let at = 0; at < files.length; at += ATTACHMENT_STAT_BATCH) {
      const sizes = await Promise.all(
        files.slice(at, at + ATTACHMENT_STAT_BATCH).map((rel) => this.readableSize(path.join(target, rel))),
      );

      for (const size of sizes) {
        bytes += size;
        least += Math.ceil(size / ATTACHMENT_MOST_BYTES_PER_CHARACTER);
      }

      if (least > bound) {
        return null;
      }
    }

    return {
      path: target,
      name,
      kind: "folder",
      bytes,
      least,
    };
  }

  /** Every picked one of a question, packed in order, reading no further than the ceiling allows. */
  async packAll(targets: string[], ceiling: number): Promise<PackedAttachment[]> {
    const budget: PackBudget = {
      left: ceiling,
    };
    const packed: PackedAttachment[] = [];

    for (const target of targets) {
      packed.push(await this.pack(target, budget));
    }

    return packed;
  }

  /** One file or folder packed into text; with no budget, packed whole. */
  async pack(
    target: string,
    budget: PackBudget = {
      left: Number.POSITIVE_INFINITY,
    },
  ): Promise<PackedAttachment> {
    const name = path.basename(target);
    const isFolder = (await stat(target)).isDirectory();
    const writing: PackWriting = {
      parts: [],
      budget,
    };
    const binaries: string[] = [];

    this.write(writing, `${this.header(name)}\n\n`);

    if (isFolder) {
      await this.folder(target, writing, binaries);
    } else if (!this.isOver(writing)) {
      await this.block(writing, target, name, binaries);
    }

    this.write(writing, "\n");

    return {
      path: target,
      name,
      kind: isFolder ? "folder" : "file",
      text: writing.parts.join(""),
      binaries,
    };
  }

  /** The tree of every path under the folder, then each file's block, until the ceiling is crossed. */
  private async folder(target: string, writing: PackWriting, binaries: string[]): Promise<void> {
    const files: string[] = [];
    let lines = 0;

    this.write(writing, `${ATTACHMENT_TREE_LABEL}\n`);

    const isWalked = await this.walk(target, "", (entry) => {
      if (this.isOver(writing)) {
        return false;
      }

      this.write(writing, this.treeLine(entry, lines));
      lines += 1;

      if (!entry.isDenied) {
        files.push(entry.rel);
      }

      return true;
    });

    if (!isWalked || this.isOver(writing)) {
      return;
    }

    this.write(writing, "\n\n");

    for (const [at, rel] of files.entries()) {
      if (this.isOver(writing)) {
        return;
      }

      if (at > 0) {
        this.write(writing, "\n\n");
      }

      await this.block(writing, path.join(target, rel), rel, binaries);
    }
  }

  /**
   * One file under its own path, read no further than the remaining ceiling can take; an unreadable file keeps its rule,
   * marked, with no content.
   */
  private async block(writing: PackWriting, file: string, rel: string, binaries: string[]): Promise<void> {
    let content: FileContent;

    try {
      content = await this.contentOf(file, writing.budget);
    } catch (error) {
      if (!isDenied(error)) {
        throw error;
      }

      this.write(writing, this.ruleLine(rel, ATTACHMENT_DENIED_TAG));

      return;
    }

    if (content.isBinary) {
      binaries.push(rel);
    }

    this.write(writing, this.ruleLine(rel, content.isBinary ? ATTACHMENT_BINARY_TAG : ""));
    this.write(writing, content.text);
  }

  /**
   * Hands every file under the folder, in name order, to `visit`, which says whether to go on; symlinks are skipped and
   * an unopenable folder is handed over as such. Returns false when `visit` stopped it.
   */
  private async walk(root: string, rel: string, visit: (entry: WalkedEntry) => boolean): Promise<boolean> {
    let listed;

    try {
      listed = await readdir(path.join(root, rel), {
        withFileTypes: true,
      });
    } catch (error) {
      // The picked folder itself is reported; one inside it is marked and passed.
      if (rel === "" || !isDenied(error)) {
        throw error;
      }

      return visit({
        rel,
        isDenied: true,
      });
    }

    const entries = listed
      .filter((entry) => !entry.isSymbolicLink())
      .sort((one, other) => one.name.localeCompare(other.name));

    for (const entry of entries) {
      const childRel = rel === "" ? entry.name : `${rel}/${entry.name}`;

      if (entry.isDirectory()) {
        if (!(await this.walk(root, childRel, visit))) {
          return false;
        }
      } else if (
        entry.isFile() &&
        !visit({
          rel: childRel,
          isDenied: false,
        })
      ) {
        return false;
      }
    }

    return true;
  }

  /** A file's size where readable; an unreadable one weighs nothing. */
  private async readableSize(file: string): Promise<number> {
    try {
      await access(file, constants.R_OK);

      return (await stat(file)).size;
    } catch (error) {
      if (!isDenied(error)) {
        throw error;
      }

      return 0;
    }
  }

  /**
   * The file as text, or as base64 when a zero among its first bytes marks it non-text. Read only four bytes per
   * character left, which still crosses the ceiling if the file is longer.
   */
  private async contentOf(file: string, budget: PackBudget): Promise<FileContent> {
    const most = Number.isFinite(budget.left)
      ? Math.max(0, budget.left + 1) * ATTACHMENT_MOST_BYTES_PER_CHARACTER
      : Number.POSITIVE_INFINITY;
    const buffer = await this.bytesOf(file, most);
    const isBinary = buffer.subarray(0, ATTACHMENT_BINARY_SNIFF_BYTES).includes(0);

    return {
      text: isBinary ? buffer.toString("base64") : buffer.toString("utf8"),
      isBinary,
    };
  }

  private async bytesOf(file: string, most: number): Promise<Buffer> {
    const handle = await open(file, "r");

    try {
      const { size } = await handle.stat();
      const buffer = Buffer.alloc(Math.min(size, most));
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);

      return buffer.subarray(0, bytesRead);
    } finally {
      await handle.close();
    }
  }

  private treeLine(entry: WalkedEntry, at: number): string {
    const said = entry.isDenied ? `${entry.rel}/${ATTACHMENT_DENIED_TAG}` : entry.rel;

    return `${at === 0 ? "" : "\n"}${ATTACHMENT_TREE_INDENT}${said}`;
  }

  private ruleLine(rel: string, tag: string): string {
    return `${ATTACHMENT_FILE_RULE} ${rel}${tag} ${ATTACHMENT_FILE_RULE}\n`;
  }

  /** A piece of the pack, counted off the ceiling the way the ceiling counts. */
  private write(writing: PackWriting, piece: string): void {
    writing.parts.push(piece);
    writing.budget.left -= characters(piece);
  }

  private isOver(writing: PackWriting): boolean {
    return writing.budget.left < 0;
  }

  private header(name: string): string {
    return `${ATTACHMENT_HEADER_PREFIX}${name}${ATTACHMENT_HEADER_SUFFIX}`;
  }
}

function isDenied(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const { code } = <{ code?: unknown }>error;

  return typeof code === "string" && ATTACHMENT_DENIED_CODES.includes(code);
}

/** Characters as the person sees them (a surrogate pair is one), as the turn's ceiling counts. */
function characters(text: string): number {
  let count = 0;

  for (let at = 0; at < text.length; at += 1) {
    const code = text.charCodeAt(at);
    const previous = at === 0 ? 0 : text.charCodeAt(at - 1);
    const isLowHalf = code >= ATTACHMENT_LOW_SURROGATE_FIRST && code <= ATTACHMENT_LOW_SURROGATE_LAST;
    const followsHighHalf = previous >= ATTACHMENT_HIGH_SURROGATE_FIRST && previous <= ATTACHMENT_HIGH_SURROGATE_LAST;

    if (!isLowHalf || !followsHighHalf) {
      count += 1;
    }
  }

  return count;
}
