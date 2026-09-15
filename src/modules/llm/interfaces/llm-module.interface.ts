import type { LlmController } from "../controllers";

/** What `createLlmModule` hands back: the controller the app registers its channel against. */
export interface LlmModule {
  controller: LlmController;
}
