import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IsInt, IsNotEmpty, IsString } from "class-validator";
import { DtoArgumentValidator } from "./dto-argument-validator.service";

class SetSecret {
  @IsString()
  @IsNotEmpty()
  providerId = "";

  @IsInt()
  tries = 0;
}

function dto(patch: Partial<SetSecret> = {}): SetSecret {
  return Object.assign(new SetSecret(), {
    providerId: "openrouter",
    tries: 1,
    ...patch,
  });
}

describe("DtoArgumentValidator", () => {
  it("lets a whole argument through", async () => {
    await new DtoArgumentValidator().validateAll([dto()]);
  });

  it("refuses an argument that breaks its own rule", async () => {
    await assert.rejects(() =>
      new DtoArgumentValidator().validateAll([
        dto({
          providerId: "",
        }),
      ]),
    );
  });

  it("looks at every argument and not only the first", async () => {
    // Every dto argument is checked, not just the first.
    await assert.rejects(() =>
      new DtoArgumentValidator().validateAll([
        dto(),
        dto({
          tries: <number>(<unknown>"багато"),
        }),
      ]),
    );
  });

  it("walks past what is not an object at all", async () => {
    // Plain values crossing beside dtos carry no rules and pass.
    await new DtoArgumentValidator().validateAll(["/tmp/coder", 12, true, null, undefined]);
  });
});
