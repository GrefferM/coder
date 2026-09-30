import assert from "node:assert/strict";
import { chmod, mkdtemp, mkdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { before, describe, it } from "node:test";
import { AttachmentPacker } from "./attachment-packer.service";
import type { PickedAttachment } from "../interfaces";
import { ATTACHMENT_BINARY_TAG, ATTACHMENT_DENIED_TAG, ATTACHMENT_TREE_LABEL } from "../constants";

describe("AttachmentPacker", () => {
  let root = "";
  let big = "";
  const HUGE = 1_000_000;
  const packer = new AttachmentPacker();

  /** With no room to count against, a pick is counted to the end. */
  async function measured(target: string): Promise<PickedAttachment> {
    const picked = await packer.measure(target);

    assert.ok(picked !== null);

    return picked;
  }
  const PNG = Buffer.from([0x89, 0x50, 0x00, 0x01]);

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "pack-"));
    await writeFile(path.join(root, "readme.md"), "\u041f\u0440\u0438\u0432\u0456\u0442");
    await writeFile(path.join(root, "logo.png"), PNG);
    await mkdir(path.join(root, "src"));
    await writeFile(path.join(root, "src", "index.ts"), "export const a = 1;");
    await mkdir(path.join(root, "node_modules"));
    await writeFile(path.join(root, "node_modules", "dep.js"), "module.exports = 1;");
    big = await mkdtemp(path.join(tmpdir(), "pack-big-"));
    await writeFile(path.join(big, "huge.txt"), "a".repeat(HUGE));
  });

  it("packs a single text file as its own block with the content whole", async () => {
    const packed = await packer.pack(path.join(root, "readme.md"));

    assert.equal(packed.kind, "file");
    assert.equal(packed.binaries.length, 0);
    assert.match(packed.text, /readme\.md/);
    assert.match(packed.text, /\u041f\u0440\u0438\u0432\u0456\u0442/);
  });

  it("includes a binary file as base64 rather than dropping it or breaking the text", async () => {
    const packed = await packer.pack(path.join(root, "logo.png"));

    assert.deepEqual(packed.binaries, ["logo.png"]);
    assert.match(packed.text, new RegExp(ATTACHMENT_BINARY_TAG.trim()));
    assert.match(packed.text, new RegExp(PNG.toString("base64")));
  });

  it("packs a folder as a tree and every file, leaving nothing out", async () => {
    const packed = await packer.pack(root);

    assert.equal(packed.kind, "folder");
    assert.match(packed.text, new RegExp(ATTACHMENT_TREE_LABEL));
    assert.match(packed.text, /src\/index\.ts/);
    assert.match(packed.text, /export const a = 1;/);
    // Nothing excluded: `node_modules` is walked like any folder.
    assert.match(packed.text, /node_modules\/dep\.js/);
    assert.match(packed.text, /module\.exports/);
    // The binary is in, as base64.
    assert.ok(packed.binaries.includes("logo.png"));
    assert.match(packed.text, new RegExp(PNG.toString("base64")));
  });

  it("names and weighs a picked file without packing it", async () => {
    const picked = await measured(path.join(root, "readme.md"));

    assert.equal(picked.path, path.join(root, "readme.md"));
    assert.equal(picked.name, "readme.md");
    assert.equal(picked.kind, "file");
    assert.equal(picked.bytes, (await stat(path.join(root, "readme.md"))).size);
  });

  it("never says more characters are the least than the pack truly comes to", async () => {
    // The least count refuses a pick before it becomes a chip, so it must never exceed the truth.
    for (const target of [path.join(root, "readme.md"), path.join(root, "logo.png"), root]) {
      const picked = await measured(target);
      const packed = await packer.pack(target);

      assert.ok(picked.least > 0);
      assert.ok(picked.least <= [...packed.text].length, `${target}: ${picked.least} > ${[...packed.text].length}`);
    }
  });

  it("marks a folder the system will not open and walks on, instead of failing the whole pick", async () => {
    const shut = await mkdtemp(path.join(tmpdir(), "pack-shut-"));

    await writeFile(path.join(shut, "open.txt"), "видно");
    await mkdir(path.join(shut, "wizards"));
    await writeFile(path.join(shut, "wizards", "inside.txt"), "усередині");
    await chmod(path.join(shut, "wizards"), 0o000);

    try {
      const picked = await measured(shut);
      const packed = await packer.pack(shut);

      assert.equal(picked.kind, "folder");
      assert.match(packed.text, /видно/);
      // Whether the system honours the shut folder varies: a refused one is marked in the tree, an open one is listed
      // normally; the pick succeeds either way.
      if (packed.text.includes(`wizards/${ATTACHMENT_DENIED_TAG}`)) {
        assert.doesNotMatch(packed.text, /усередині/);
      } else {
        assert.match(packed.text, /усередині/);
      }
    } finally {
      await chmod(path.join(shut, "wizards"), 0o755);
    }
  });

  it("weighs a picked folder as every file in it, node_modules and binaries too", async () => {
    const files = ["readme.md", "logo.png", "src/index.ts", "node_modules/dep.js"];
    const sizes = await Promise.all(files.map(async (file) => (await stat(path.join(root, file))).size));
    const picked = await measured(root);

    assert.equal(picked.kind, "folder");
    assert.equal(
      picked.bytes,
      sizes.reduce((sum, size) => sum + size, 0),
    );
  });

  it("packs whole where the ceiling holds it, the same as a pack with no ceiling at all", async () => {
    const whole = await packer.pack(root);
    const [packed] = await packer.packAll([root], 1_000_000);

    assert.equal(packed.text, whole.text);
  });

  it("reads no further than it takes to cross the ceiling, and crosses it", async () => {
    // A megabyte under a ceiling of a hundred characters: the pack reaches over the ceiling without reading the whole
    // file.
    const [packed] = await packer.packAll([path.join(big, "huge.txt")], 100);

    assert.ok([...packed.text].length > 100);
    assert.ok(packed.text.length < HUGE / 100);
  });

  it("shares one ceiling between every attachment of a question", async () => {
    const [first, second] = await packer.packAll([path.join(big, "huge.txt"), path.join(root, "readme.md")], 100);

    assert.ok([...first.text].length > 100);
    // The first already crossed the ceiling, so the second is named and not read.
    assert.doesNotMatch(second.text, /Привіт/);
  });

  it("refuses a pick whose fewest characters are over the room, and takes one that fits", async () => {
    assert.equal(await packer.measure(path.join(big, "huge.txt"), 100), null);
    assert.equal(await packer.measure(root, 10), null);
    assert.notEqual(await packer.measure(root, 1_000_000), null);
  });
});
