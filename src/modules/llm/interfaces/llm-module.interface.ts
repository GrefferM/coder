import type { LlmController } from "../controllers";

/** What `createLlmModule` returns: the controller the app registers its channel against. */
export interface LlmModule {
  controller: LlmController;
}
