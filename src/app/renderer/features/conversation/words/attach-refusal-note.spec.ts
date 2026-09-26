import { describe, expect, it } from "vitest";
import { refusedPickNote } from "./attach-refusal-note";
import type { RefusedPick } from "../../../interfaces";

function refused(patch: Partial<RefusedPick>): RefusedPick {
  return {
    path: "/projects/big-repo",
    name: "big-repo",
    kind: "folder",
    reason: "tooBig",
    code: null,
    message: null,
    ...patch,
  };
}

describe("refusedPickNote", () => {
  it("says in a few words that a folder is too big, and that nothing was attached", () => {
    expect(refusedPickNote(refused({}))).toBe("«big-repo/» — завелика, не прикріплено");
  });

  it("says it of a file in the file's own gender", () => {
    expect(
      refusedPickNote(
        refused({
          name: "dump.sql",
          kind: "file",
        }),
      ),
    ).toBe("«dump.sql» — завеликий, не прикріплено");
  });

  it("says «немає доступу» where the system would not let us read it", () => {
    expect(
      refusedPickNote(
        refused({
          name: "secret",
          reason: "unread",
          code: "EACCES",
          message: "EACCES: permission denied, scandir '/projects/secret'",
        }),
      ),
    ).toBe("«secret/» — немає доступу, не прикріплено");
  });

  it("says anything else as the system said it", () => {
    expect(
      refusedPickNote(
        refused({
          name: "gone",
          kind: null,
          reason: "unread",
          code: "ENOENT",
          message: "no such file",
        }),
      ),
    ).toBe("«gone» — no such file, не прикріплено");
  });
});
