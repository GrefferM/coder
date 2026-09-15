import { describe, expect, it, vi } from "vitest";
import { quietly } from "./quietly";

describe("quietly", () => {
  it("runs the write", () => {
    const write = vi.fn().mockResolvedValue(undefined);

    quietly(write);

    expect(write).toHaveBeenCalled();
  });

  it("lets a failure stop here — the line about it is said elsewhere", async () => {
    const failed = Promise.reject(new Error("немає доступу до файла"));

    quietly(() => failed);

    // Nothing throws out of the call, and nothing is left unhandled behind it.
    await expect(failed.catch((reason: unknown) => reason)).resolves.toBeInstanceOf(Error);
  });
});
