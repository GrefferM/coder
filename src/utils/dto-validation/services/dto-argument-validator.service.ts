import { validateOrReject } from "class-validator";

/** Validates every object argument through class-validator. */
export class DtoArgumentValidator {
  async validateAll(args: unknown[]): Promise<void> {
    for (const argument of args) {
      if (argument !== null && typeof argument === "object") {
        await validateOrReject(argument);
      }
    }
  }
}
