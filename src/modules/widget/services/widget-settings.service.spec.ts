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
      chosen: {},
      isSilent: false,
    });
  });

  it("lays each change over what stands, so a project opened outlives a sphere chosen after", async () => {
    const service = await aService();

    await service.change({
      directory: "/work/english",
    });
    await service.change({
      chosen: {
        "/work/english": "agent-1",
      },
    });

    assert.deepEqual(await service.settings(), {
      directory: "/work/english",
      chosen: {
        "/work/english": "agent-1",
      },
      isSilent: false,
    });
  });

  it("keeps the widget silent once its speaker is turned off", async () => {
    const service = await aService();

    await service.change({
      isSilent: true,
    });

    assert.equal((await service.settings()).isSilent, true);
  });

  it("keeps both of two changes made at once", async () => {
    const service = await aService();

    await Promise.all([
      service.change({
        directory: "/work/english",
      }),
      service.change({
        chosen: {
          "/work/english": "agent-1",
        },
      }),
    ]);

    const settings = await service.settings();

    assert.equal(settings.directory, "/work/english");
    assert.deepEqual(settings.chosen, {
      "/work/english": "agent-1",
    });
  });
});
