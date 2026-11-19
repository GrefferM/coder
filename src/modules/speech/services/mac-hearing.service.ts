import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  MAC_ALLOW_WAIT_MS,
  MAC_ANSWER_FILE_NAME,
  MAC_CALL_DIRECTORY_PREFIX,
  MAC_HEAR_WAIT_MS,
  MAC_LOOK_WAIT_MS,
  MAC_OPEN_ARGUMENTS,
  MAC_RECORDING_FILE_NAME,
  MAC_SILENT_WORDS,
} from "../constants";
import { SPEECH_HEARING_FAILED, SPEECH_MAC_DENIED } from "../interfaces";
import { Refusal } from "../../../utils/refusals";
import type { MacAnswer, MacCall, MacListener, MacPermission, MacRecording } from "../interfaces";

const run = promisify(execFile);

/**
 * macOS's recognition through Coder Hearing, an app of its own beside Coder, so the system asks its permission for it
 * alike under `dev:app` and in the built app. Each call launches it once and reads the one line it leaves.
 */
export class MacHearing implements MacListener {
  constructor(private readonly appPath: string) {}

  async permission(): Promise<MacPermission> {
    return this.permissionOf(
      await this.ask({
        command: "status",
        waitMs: MAC_LOOK_WAIT_MS,
      }),
    );
  }

  async allow(): Promise<MacPermission> {
    return this.permissionOf(
      await this.ask({
        command: "allow",
        waitMs: MAC_ALLOW_WAIT_MS,
      }),
    );
  }

  async locales(): Promise<string[]> {
    const answer = await this.ask({
      command: "locales",
      waitMs: MAC_LOOK_WAIT_MS,
    });

    return answer.locales ?? [];
  }

  /**
   * The words said, macOS asking its permission first where it never has; a refused permission and a failure of
   * macOS's own are refusals.
   */
  async hear({ audio, locale }: MacRecording): Promise<string> {
    // Never asked yet, as after a build signed anew: macOS asks the person now, once, and the recording waits for it.
    if ((await this.permission()) === "undetermined") {
      await this.allow();
    }

    const answer = await this.ask({
      command: "hear",
      waitMs: MAC_HEAR_WAIT_MS,
      recording: {
        audio,
        locale,
      },
    });

    if (answer.refused !== undefined) {
      throw new Refusal(SPEECH_MAC_DENIED);
    }

    if (answer.failed !== undefined) {
      throw new Refusal(SPEECH_HEARING_FAILED, answer.failed);
    }

    return (answer.text ?? "").trim();
  }

  /**
   * Launches Coder Hearing on one command in a folder of its own, reads its answer, and clears the folder. One that
   * leaves no answer, in its time or at all, is a refusal saying so.
   */
  private async ask({ command, waitMs, recording }: MacCall): Promise<MacAnswer> {
    const directory = await mkdtemp(path.join(os.tmpdir(), MAC_CALL_DIRECTORY_PREFIX));
    const answerPath = path.join(directory, MAC_ANSWER_FILE_NAME);

    try {
      const heard = await this.recordingArguments(directory, recording);

      await this.launch([...MAC_OPEN_ARGUMENTS, this.appPath, "--args", command, answerPath, ...heard], waitMs);

      if (!existsSync(answerPath)) {
        throw new Refusal(SPEECH_HEARING_FAILED, MAC_SILENT_WORDS);
      }

      return <MacAnswer>JSON.parse(await readFile(answerPath, "utf8"));
    } finally {
      await rm(directory, {
        recursive: true,
        force: true,
      });
    }
  }

  /**
   * Runs `open` and waits for it, stopping it past its time. Its own exit says nothing: an app that answers before
   * `open` begins to wait makes it fail with the answer already written, so the answer file alone says how it went.
   */
  private async launch(args: string[], waitMs: number): Promise<void> {
    await run("open", args, {
      timeout: waitMs,
    }).then(
      () => undefined,
      () => undefined,
    );
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
