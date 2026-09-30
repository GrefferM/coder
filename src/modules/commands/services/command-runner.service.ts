import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  COMMAND_CODE_SLOT,
  COMMAND_EMPTY_OUTPUT_NOTE,
  COMMAND_FAILED_PREFIX,
  COMMAND_NOTHING_PRINTED_NOTE,
  COMMAND_SLOT_PATTERN,
  COMMAND_UNRUNNABLE_CODES,
} from "../constants";
import type { CommandCall, CommandResult } from "../interfaces";

const run = promisify(exec);

/** Runs one declared command; stdout and stderr both come back. */
export class CommandRunner {
  async call(payload: CommandCall): Promise<CommandResult> {
    const line = this.line(payload);

    try {
      // `maxBuffer: undefined` lifts the output cap.
      const { stdout, stderr } = await run(line, {
        cwd: payload.directory,
        maxBuffer: undefined,
        // A stop kills the process; the abort surfaces as a failure the turn treats as stopped.
        signal: payload.signal,
      });

      return {
        line,
        output: this.said(`${stdout}${stderr}`),
        isFailed: false,
        exitCode: 0,
      };
    } catch (failure) {
      return {
        line,
        output: this.wentWrong(failure),
        isFailed: true,
        exitCode: this.code(failure),
      };
    }
  }

  /** The declared line with its slots filled; values go in verbatim, unquoted. */
  private line(payload: CommandCall): string {
    const declared = new Set(payload.declared);

    return payload.run.replace(COMMAND_SLOT_PATTERN, (slot) => {
      const name = slot.slice(1, -1);

      if (!declared.has(name)) {
        return slot;
      }

      return Object.hasOwn(payload.arguments, name) ? payload.arguments[name] : "";
    });
  }

  /** Output for a failed run: what it printed, else a note with the exit code, else the failure itself. */
  private wentWrong(failure: unknown): string {
    const said = this.printed(failure);

    if (said !== "") {
      return this.said(said);
    }

    const code = this.code(failure);

    return code === null || COMMAND_UNRUNNABLE_CODES.includes(code)
      ? `${COMMAND_FAILED_PREFIX} ${String(failure)}`
      : COMMAND_NOTHING_PRINTED_NOTE.replace(COMMAND_CODE_SLOT, String(code));
  }

  /** The numeric exit code, if any. */
  private code(failure: unknown): number | null {
    if (typeof failure !== "object" || failure === null || !("code" in failure)) {
      return null;
    }

    return typeof failure.code === "number" ? failure.code : null;
  }

  /** What a failed run printed before it failed. */
  private printed(failure: unknown): string {
    if (typeof failure !== "object" || failure === null) {
      return "";
    }

    const out = "stdout" in failure ? String(failure.stdout) : "";
    const error = "stderr" in failure ? String(failure.stderr) : "";

    return `${out}${error}`.trim();
  }

  /** The trimmed output, or a note when there is none. */
  private said(output: string): string {
    const printed = output.trim();

    return printed === "" ? COMMAND_EMPTY_OUTPUT_NOTE : printed;
  }
}
