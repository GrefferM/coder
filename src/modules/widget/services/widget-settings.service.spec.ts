import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { WidgetSettingsService } from "./widget-settings.service";

async function aService(): Promise<WidgetSettingsService> {
  return new WidgetSettingsService(await mkdtemp(path.join(os.tmpdir(), "coder-widget-")));
}

describe("WidgetSettingsService", () => {
  it("reads nothing chosen where nothing was written", async () => {
    const service = await aService();

    assert.deepEqual(await service.settings(), {
      directory: null,
      place: null,
      chosen: {},
    });
  });

  it("lays each change over what stands, so a place written by the window outlives a sphere chosen after", async () => {
    const service = await aService();

    await service.change({
      place: {
        x: 40,
        y: 60,
      },
    });
    await service.change({
      chosen: {
        "/work/english": "agent-1",
      },
    });

    assert.deepEqual(await service.settings(), {
      directory: null,
      place: {
        x: 40,
        y: 60,
      },
      chosen: {
        "/work/english": "agent-1",
      },
    });
  });

  it("keeps both of two changes made at once", async () => {
    const service = await aService();

    await Promise.all([
      service.change({
        directory: "/work/english",
      }),
      service.change({
        place: {
          x: 1,
          y: 2,
        },
      }),
    ]);

    const settings = await service.settings();

    assert.equal(settings.directory, "/work/english");
    assert.deepEqual(settings.place, {
      x: 1,
      y: 2,
    });
  });
});
