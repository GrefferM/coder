import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";
import { SECRET_HINT_BULLETS, SECRET_STORE_UNAVAILABLE } from "../constants";
import { SecretService } from "./secret.service";
import type { SecretCipher } from "../interfaces";

/** A reversible stand-in for the machine's encryption. */
function cipherThatWorks(): SecretCipher {
  return {
    isAvailable: () => true,
    encrypt: (value) => Buffer.from(`sealed:${value}`, "utf8"),
    decrypt: (encrypted) => encrypted.toString("utf8").replace(/^sealed:/, ""),
  };
}

describe("SecretService", () => {
  let userDataDirectory: string;
  let secretService: SecretService;

  beforeEach(async () => {
    userDataDirectory = await mkdtemp(path.join(os.tmpdir(), "coder-secrets-"));
    secretService = new SecretService(cipherThatWorks(), userDataDirectory);
  });

  it("keeps the value, and gives back only enough of it to be recognised", async () => {
    const hint = await secretService.set({
      key: "provider-key:anthropic",
      value: "sk-ant-api03-longvalue4Kd",
    });

    assert.equal(hint.hint, `sk-ant-${SECRET_HINT_BULLETS}4Kd`);
    assert.equal(await secretService.value("provider-key:anthropic"), "sk-ant-api03-longvalue4Kd");
  });

  it("never writes the value itself to the file", async () => {
    await secretService.set({
      key: "provider-key:anthropic",
      value: "sk-ant-api03-longvalue4Kd",
    });

    const written = await readFile(path.join(userDataDirectory, "secrets.json"), "utf8");

    assert.equal(written.includes("sk-ant-api03-longvalue4Kd"), false);
  });

  it("says nothing about the length of a short secret", async () => {
    const hint = await secretService.set({
      key: "provider-key:ollama",
      value: "short",
    });

    assert.equal(hint.hint, SECRET_HINT_BULLETS);
  });

  it("holds several at once, and takes one away without touching the rest", async () => {
    await secretService.set({
      key: "provider-key:anthropic",
      value: "sk-ant-api03-longvalue4Kd",
    });
    await secretService.set({
      key: "provider-key:openai",
      value: "sk-proj-api03-othervalue9Zx",
    });
    await secretService.remove({
      key: "provider-key:anthropic",
    });

    const hints = await secretService.hints();

    assert.deepEqual(
      hints.map((held) => held.key),
      ["provider-key:openai"],
    );
  });

  it("takes away one that was never there without complaining — the end state is the same", async () => {
    await secretService.remove({
      key: "provider-key:google",
    });

    assert.deepEqual(await secretService.hints(), []);
  });

  it("refuses to write anything on a machine that will not encrypt", async () => {
    const plain = new SecretService(
      {
        isAvailable: () => false,
        encrypt: () => Buffer.from(""),
        decrypt: () => "",
      },
      userDataDirectory,
    );

    await assert.rejects(
      plain.set({
        key: "provider-key:anthropic",
        value: "sk-ant-api03-longvalue4Kd",
      }),
      new RegExp(SECRET_STORE_UNAVAILABLE),
    );
    assert.deepEqual(await plain.hints(), []);
  });
});
