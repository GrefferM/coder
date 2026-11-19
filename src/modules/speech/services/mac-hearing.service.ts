import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  MAC_ANSWER_FILE_NAME,
  MAC_CALL_DIRECTORY_PREFIX,
  MAC_OPEN_ARGUMENTS,
  MAC_RECORDING_FILE_NAME,
} from "../constants";
import { SPEECH_HEARING_FAILED, SPEECH_MAC_DENIED } from "../interfaces";
import { Refusal } from "../../../utils/refusals";
import type { MacAnswer, MacListener, MacPermission, MacRecording } from "../interfaces";

const run = promisify(execFile);

/**
 * macOS's recognition through Coder Hearing, an app of its own beside Coder, so the system asks its permission for it
 * alike under `dev:app` and in the built app. Each call launches it once and reads the one line it leaves.
 */
export class MacHearing implements MacListener {
  constructor(private readonly appPath: string) {}

  async permission(): Promise<MacPermission> {
    return this.permissionOf(await this.ask(["status"]));
  }

  async allow(): Promise<MacPermission> {
    return this.permissionOf(await this.ask(["allow"]));
  }

  async locales(): Promise<string[]> {
    const answer = await this.ask(["locales"]);

    return answer.locales ?? [];
  }

  /** The words said; a refused permission and a failure of macOS's own are refusals. */
  async hear({ audio, locale }: MacRecording): Promise<string> {
    const answer = await this.ask(["hear"], {
      audio,
      locale,
    });

    if (answer.refused !== undefined) {
      throw new Refusal(SPEECH_MAC_DENIED);
    }

    if (answer.failed !== undefined) {
      throw new Refusal(SPEECH_HEARING_FAILED, answer.failed);
    }

    return (answer.text ?? "").trim();
  }

  /** Launches Coder Hearing on one command in a folder of its own, reads its answer, and clears the folder. */
  private async ask(command: string[], recording?: MacRecording): Promise<MacAnswer> {
    const directory = await mkdtemp(path.join(os.tmpdir(), MAC_CALL_DIRECTORY_PREFIX));
    const answerPath = path.join(directory, MAC_ANSWER_FILE_NAME);

    try {
      const heard = await this.recordingArguments(directory, recording);

      await run("open", [...MAC_OPEN_ARGUMENTS, this.appPath, "--args", ...command, answerPath, ...heard]);

      return <MacAnswer>JSON.parse(await readFile(answerPath, "utf8"));
    } finally {
      await rm(directory, {
        recursive: true,
        force: true,
      });
    }
  }

  /** The recording laid in the call's folder, and the two arguments that name it and its language. */
  private async recordingArguments(directory: string, recording?: MacRecording): Promise<string[]> {
    if (recording === undefined) {
      return [];
    }

    const recordingPath = path.join(directory, MAC_RECORDING_FILE_NAME);

    await writeFile(recordingPath, recording.audio);

    return [recordingPath, recording.locale];
  }

  private permissionOf(answer: MacAnswer): MacPermission {
    if (answer.permission === "allowed" || answer.permission === "undetermined") {
      return answer.permission;
    }

    return "denied";
  }
}
