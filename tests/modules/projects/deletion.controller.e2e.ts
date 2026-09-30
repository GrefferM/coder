import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { DeletionController } from "../../../src/modules/projects/controllers/deletion.controller";
import { ForgetDeletionDto, OpenProjectDto, RememberDeletionDto } from "../../../src/modules/projects/dto";
import { DELETION_KINDS } from "../../../src/modules/projects/constants";
import type { DeletionService } from "../../../src/modules/projects/services";

const DIRECTORY = "/tmp/coder-project";
const DELETION = "77777777-7777-4777-8777-777777777777";
const [KIND] = DELETION_KINDS;

let asked: { name: string; with: unknown }[] = [];

function controller(): DeletionController {
  const service = <DeletionService>(<unknown>{
    remember: async (payload: unknown) => {
      asked.push({
        name: "remember",
        with: payload,
      });

      return DELETION;
    },
    list: async (payload: unknown) => {
      asked.push({
        name: "list",
        with: payload,
      });

      return [];
    },
    forget: async (payload: unknown) => {
      asked.push({
        name: "forget",
        with: payload,
      });
    },
  });

  return new DeletionController(service);
}

function remembering(patch: Record<string, unknown> = {}): RememberDeletionDto {
  return Object.assign(new RememberDeletionDto(), {
    directory: DIRECTORY,
    kind: KIND,
    name: "ТЕЗАР",
    taken: {
      agents: [],
    },
    ...patch,
  });
}

describe("DeletionController", () => {
  beforeEach(() => {
    asked = [];
  });

  it("remembers a deletion and answers with the row it made", async () => {
    assert.equal(await controller().remember(remembering()), DELETION);
  });

  it("asks for a project's deletions by the folder alone", async () => {
    // The dto is the door's shape; the folder itself goes further in.
    await controller().list(
      Object.assign(new OpenProjectDto(), {
        directory: DIRECTORY,
      }),
    );

    assert.deepEqual(asked[0].with, DIRECTORY);
  });

  it("refuses a kind of thing the app does not delete", async () => {
    // Ways back exist only for the five kinds the project holds.
    await assert.rejects(() =>
      controller().remember(
        remembering({
          kind: "провайдер",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("refuses a deletion with no folder, no name, or nothing taken", async () => {
    await assert.rejects(() =>
      controller().remember(
        remembering({
          directory: "",
        }),
      ),
    );
    await assert.rejects(() =>
      controller().remember(
        remembering({
          name: "",
        }),
      ),
    );
    await assert.rejects(() =>
      controller().remember(
        remembering({
          taken: "агент",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });

  it("refuses to forget a row named by anything but its id", async () => {
    await assert.rejects(() =>
      controller().forget(
        Object.assign(new ForgetDeletionDto(), {
          id: "останнє",
        }),
      ),
    );
    assert.deepEqual(asked, []);
  });
});
