import { CONFIGURE_WALKS_CHANNEL } from "../../../../../contracts";
import type { ProjectConfig } from "../../../../../contracts";

/** The config as the screen holds it now; the walks that go on read it. */
export async function configureWalks(config: ProjectConfig): Promise<void> {
  return window.electronApi.invoke(CONFIGURE_WALKS_CHANNEL, {
    config,
  });
}
