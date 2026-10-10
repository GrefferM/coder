import type { LlmController } from "../controllers";
import type { LlmService } from "../services";

/** What `createLlmModule` returns: the controller the app registers its channel against, and the service a walk asks. */
export interface LlmModule {
  controller: LlmController;
  service: LlmService;
}
