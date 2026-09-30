import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";
import {
  COMMAND_CODE_SLOT,
  COMMAND_EMPTY_OUTPUT_NOTE,
  COMMAND_FAILED_PREFIX,
  COMMAND_NOTHING_PRINTED_NOTE,
} from "../constants";
import { CommandRunner } from "./command-runner.service";

describe("CommandRunner", () => {
  let commandRunner: CommandRunner;
  let directory: string;

  beforeEach(async () => {
    commandRunner = new CommandRunner();
    directory = await mkdtemp(path.join(os.tmpdir(), "coder-commands-"));
  });

  it("fills the braces of the declared line with the arguments it was called with", async () => {
    const result = await commandRunner.call({
      run: "echo {greeting} {name}",
      directory,
      arguments: {
        greeting: "Привіт",
        name: "EDITOR",
      },
      declared: ["greeting", "name"],
    });

    assert.equal(result.output, "Привіт EDITOR");
    assert.equal(result.isFailed, false);
  });

  it("puts a value in as it stands, so what it means in the line is the line's own business", async () => {
    const result = await commandRunner.call({
      run: "echo {text}",
      directory,
      arguments: {
        text: "one; echo two",
      },
      declared: ["text"],
    });

    // A value goes in as it stands, and the shell reads the semicolon.
    assert.equal(result.output, "one\ntwo");
  });

  it("puts a value in whole where the person's own line quotes the slot", async () => {
    const result = await commandRunner.call({
      run: "echo '{text}'",
      directory,
      arguments: {
        text: "one; echo two",
      },
      declared: ["text"],
    });

    assert.equal(result.output, "one; echo two");
  });

  it("leaves braces of a name this command never declared exactly where they are", async () => {
    await writeFile(path.join(directory, "here.txt"), "");

    const result = await commandRunner.call({
      run: "ls {path}",
      directory,
      arguments: {},
      declared: [],
    });

    // «path» is undeclared, so those braces are the line's own text.
    assert.equal(result.isFailed, true);
    assert.ok(result.output.includes("{path}"));
  });

  it("takes out the place of a declared parameter nobody filled", async () => {
    await writeFile(path.join(directory, "here.txt"), "");

    const result = await commandRunner.call({
      run: "ls {path}",
      directory,
      arguments: {},
      declared: ["path"],
    });

    assert.equal(result.output, "here.txt");
    assert.equal(result.isFailed, false);
  });

  it("does not read a value it has just put in: a slot inside it is text, not a place of its own", async () => {
    const result = await commandRunner.call({
      run: "echo {text}",
      directory,
      arguments: {
        text: "залишив {path} як є",
      },
      declared: ["path", "text"],
    });

    assert.equal(result.output, "залишив {path} як є");
  });

  it("keeps the braces the shell itself owns, since they were never ours to take", async () => {
    const result = await commandRunner.call({
      run: "echo 'a b c d e' | awk '{print $5}'",
      directory,
      arguments: {},
      declared: [],
    });

    assert.equal(result.output, "e");
    assert.equal(result.isFailed, false);
  });

  it("keeps braces inside a value whole: the value came from elsewhere and is not ours to edit", async () => {
    const result = await commandRunner.call({
      run: "echo {text}",
      directory,
      arguments: {
        text: "полагодив {} у find",
      },
      declared: ["text"],
    });

    assert.equal(result.output, "полагодив {} у find");
  });

  it("hands the line to the shell exactly as long as it was written, spaces and all", async () => {
    const result = await commandRunner.call({
      run: "  echo {text}  ",
      directory,
      arguments: {
        text: "тут",
      },
      declared: ["text"],
    });

    // Nothing of the line is trimmed.
    assert.equal(result.output, "тут");
    assert.equal(result.isFailed, false);
  });

  it("runs in the folder it was given, which is the project's own", async () => {
    await writeFile(path.join(directory, "here.txt"), "");

    const result = await commandRunner.call({
      run: "ls",
      directory,
      arguments: {},
      declared: [],
    });

    assert.equal(result.output, "here.txt");
  });

  it("hands back what a failed line printed, and says it failed", async () => {
    const result = await commandRunner.call({
      run: "echo сказане && exit 3",
      directory,
      arguments: {},
      declared: [],
    });

    assert.equal(result.output, "сказане");
    assert.equal(result.isFailed, true);
  });

  it("says so when a command printed nothing, since silence is not an answer", async () => {
    const result = await commandRunner.call({
      run: "true",
      directory,
      arguments: {},
      declared: [],
    });

    assert.equal(result.output, COMMAND_EMPTY_OUTPUT_NOTE);
  });

  it("hands a long output back whole, since no ceiling of the app's own stands on a command", async () => {
    const result = await commandRunner.call({
      run: "node -e \"process.stdout.write('a'.repeat(20000))\"",
      directory,
      arguments: {},
      declared: [],
    });

    assert.equal(result.output.length, 20000);
    assert.equal(result.isFailed, false);
  });

  it("says a line that found nothing found nothing, rather than that it did not run", async () => {
    await writeFile(path.join(directory, "here.txt"), "нічого спільного");

    const result = await commandRunner.call({
      run: "grep -rn {pattern} .",
      directory,
      arguments: {
        pattern: "чого тут немає",
      },
      declared: [],
    });

    assert.equal(result.output, COMMAND_NOTHING_PRINTED_NOTE.replace(COMMAND_CODE_SLOT, "1"));
  });

  it("hands back what the shell said about a line it could not run", async () => {
    const result = await commandRunner.call({
      run: "komandy-takoi-nemaie",
      directory,
      arguments: {},
      declared: [],
    });

    assert.ok(result.output.includes("komandy-takoi-nemaie"));
    assert.equal(result.isFailed, true);
  });

  it("keeps «не виконалась» for a line that never ran and said nothing about it either", async () => {
    const result = await commandRunner.call({
      run: "komandy-takoi-nemaie 2>/dev/null",
      directory,
      arguments: {},
      declared: [],
    });

    assert.ok(result.output.startsWith(COMMAND_FAILED_PREFIX));
    assert.equal(result.isFailed, true);
  });

  it("hands back the line as it ran, values already in it, so the record shows what really went", async () => {
    const result = await commandRunner.call({
      run: "echo {greeting} {name}",
      directory,
      arguments: {
        greeting: "Привіт",
        name: "EDITOR",
      },
      declared: ["greeting", "name"],
    });

    assert.equal(result.line, "echo Привіт EDITOR");
    assert.equal(result.exitCode, 0);
  });

  it("hands back the exit code of a line that ran and failed, since a code is not an output", async () => {
    const result = await commandRunner.call({
      run: "sh -c 'exit 3'",
      directory,
      arguments: {},
      declared: [],
    });

    assert.equal(result.isFailed, true);
    assert.equal(result.exitCode, 3);
    assert.equal(result.line, "sh -c 'exit 3'");
  });
});
