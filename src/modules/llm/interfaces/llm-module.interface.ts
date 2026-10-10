import type { LlmService } from "../services";

/** What `createLlmModule` returns: the service a walk asks. */
export interface LlmModule {
  service: LlmService;
}
