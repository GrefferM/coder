import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COMPOSER_BUDGET_SLOT,
  COMPOSER_INSTRUCTION,
  COMPOSER_MEMORY_CLOSING,
  COMPOSER_MEMORY_OPENING,
} from "./composer-words.constant";
import { composerInstruction, composerLength, composerMessage, composerWords } from "./composer-words";

describe("composerWords", () => {
  it("tells the budget in whole words, seven characters to the word", () => {
    assert.equal(composerWords(3_000), 428);
    assert.equal(composerWords(700), 100);
  });

  it("never tells fewer than one word", () => {
    assert.equal(composerWords(1), 1);
    assert.equal(composerWords(6), 1);
  });
});

describe("composerInstruction", () => {
  it("tells the limit in words, in the task and again in the last rule, and leaves no slot behind", () => {
    const told = composerInstruction(7_000);

    assert.ok(told.includes("до максимум 1000 слів"));
    assert.ok(told.includes("не більше 1000 слів"));
    assert.ok(!told.includes(COMPOSER_BUDGET_SLOT));
  });

  it("forbids answering what the memory asks and any word of its own around the summary", () => {
    assert.ok(COMPOSER_INSTRUCTION.includes("ЖОДНИХ ВІДПОВІДЕЙ НА ПИТАННЯ"));
    assert.ok(COMPOSER_INSTRUCTION.includes("ЖОДНИХ ВСТУПНИХ ФРАЗ"));
  });

  it("asks for the most important first, since the end is what is cut off", () => {
    assert.ok(COMPOSER_INSTRUCTION.includes("від найважливішого до другорядного"));
    assert.ok(COMPOSER_INSTRUCTION.includes("буде відрізано з кінця"));
  });

  it("does not ask to keep the stage of the conversation, which the composer would read as its own request", () => {
    assert.ok(!COMPOSER_INSTRUCTION.includes("поточний етап"));
  });
});

describe("composerMessage", () => {
  it("fences the memory in and puts the instruction after it, in one message", () => {
    const message = composerMessage("ЛЮДИНА:\nпривіт", 700);

    assert.ok(message.startsWith(`${COMPOSER_MEMORY_OPENING}ЛЮДИНА:\nпривіт${COMPOSER_MEMORY_CLOSING}`));
    assert.ok(message.endsWith(composerInstruction(700)));
  });
});

describe("composerLength", () => {
  it("counts the fence and the instruction, the budget told as wide as the ceiling is", () => {
    assert.equal(composerLength(10_000), [...composerMessage("", 10_000)].length);
  });

  it("holds for any budget the ceiling allows, since none has more digits than the ceiling", () => {
    assert.ok(composerLength(10_000) >= [...composerMessage("", 9_999)].length);
  });
});
