import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { openTestDatabase } from "../../../utils/testing";
import { DeletionService } from "./deletion.service";
import { DeletionEntity } from "../entities";
import type { TestDatabase } from "../../../utils/testing";

const DIRECTORY = "/tmp/coder-project";

function agentTaken(name: string): Record<string, unknown> {
  return {
    agents: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        name,
        color: "#b18aff",
      },
    ],
    links: [
      {
        id: "44444444-4444-4444-8444-444444444444",
        from: "22222222-2222-4222-8222-222222222222",
        to: "33333333-3333-4333-8333-333333333333",
      },
    ],
  };
}

describe("DeletionService", () => {
  let record: TestDatabase;
  let deletions: DeletionService;

  beforeEach(async () => {
    // A fresh real database per test; the app's own is untouched.
    record = await openTestDatabase();
    deletions = new DeletionService(record.dataSource.getRepository(DeletionEntity));
  });

  afterEach(async () => {
    await record.close();
  });

  it("keeps what a deletion took whole, and hands the envelope back as it was sealed", async () => {
    const id = await deletions.remember({
      directory: DIRECTORY,
      kind: "agent",
      name: "EDITOR",
      taken: agentTaken("EDITOR"),
    });

    const [kept] = await deletions.list(DIRECTORY);

    assert.equal(kept.id, id);
    assert.equal(kept.kind, "agent");
    assert.equal(kept.name, "EDITOR");
    assert.deepEqual(kept.taken, agentTaken("EDITOR"));
  });

  it("keeps every project's own, and hands back nobody else's", async () => {
    await deletions.remember({
      directory: DIRECTORY,
      kind: "agent",
      name: "EDITOR",
      taken: agentTaken("EDITOR"),
    });
    await deletions.remember({
      directory: "/tmp/somebody-else",
      kind: "model",
      name: "claude-sonnet-4.5",
      taken: {},
    });

    assert.deepEqual(
      (await deletions.list(DIRECTORY)).map((deletion) => deletion.name),
      ["EDITOR"],
    );
  });

  it("lets a whole project's history go, and leaves every other project's where it is", async () => {
    await deletions.remember({
      directory: DIRECTORY,
      kind: "agent",
      name: "EDITOR",
      taken: agentTaken("EDITOR"),
    });
    await deletions.remember({
      directory: "/tmp/somebody-else",
      kind: "model",
      name: "claude-sonnet-4.5",
      taken: {},
    });

    await deletions.forgetProject(DIRECTORY);

    assert.deepEqual(await deletions.list(DIRECTORY), []);
    assert.equal((await deletions.list("/tmp/somebody-else")).length, 1);
  });

  it("lets one go for good", async () => {
    await deletions.remember({
      directory: DIRECTORY,
      kind: "prompt",
      name: "Рев'ю коду",
      taken: {},
    });

    const [kept] = await deletions.list(DIRECTORY);

    await deletions.forget({
      id: kept.id,
    });

    assert.deepEqual(await deletions.list(DIRECTORY), []);
  });
});
