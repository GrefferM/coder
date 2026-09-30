import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IsNotEmpty, IsString } from "class-validator";
import { Validate } from "./validate.decorator";

class SetSecret {
  @IsString()
  @IsNotEmpty()
  providerId = "";
}

function dto(providerId: string): SetSecret {
  return Object.assign(new SetSecret(), {
    providerId,
  });
}

class Controller {
  readonly took: SetSecret[] = [];
  readonly name = "controller";

  @Validate()
  async set(one: SetSecret): Promise<string> {
    this.took.push(one);

    return `${this.name}: ${one.providerId}`;
  }
}

describe("Validate", () => {
  it("runs the method and gives back what it answered", async () => {
    const controller = new Controller();

    assert.equal(await controller.set(dto("openrouter")), "controller: openrouter");
    assert.equal(controller.took.length, 1);
  });

  it("does not run the method at all when an argument breaks its rule", async () => {
    // Refusal comes before the method body runs.
    const controller = new Controller();

    await assert.rejects(() => controller.set(dto("")));
    assert.equal(controller.took.length, 0);
  });

  it("leaves the method standing on its own object", async () => {
    // The wrapper keeps `this`.
    const controller = new Controller();

    await controller.set(dto("ollama"));

    assert.deepEqual(
      controller.took.map((one) => one.providerId),
      ["ollama"],
    );
  });
});
