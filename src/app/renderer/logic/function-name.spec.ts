import { describe, expect, it } from "vitest";
import { functionName } from "./function-name";
import { COMMAND_NAME_MAX_LENGTH } from "../../../contracts";

describe("functionName", () => {
  it("leaves a name already written as a function's is", () => {
    expect(functionName("read_file")).toBe("read_file");
  });

  it("takes out a space rather than letting it stand in a name a model calls", () => {
    expect(functionName("read file")).toBe("readfile");
  });

  it("keeps the digits of a name, which every provider takes", () => {
    expect(functionName("sha256_of")).toBe("sha256_of");
  });

  it("takes out what no provider would accept, Ukrainian letters included", () => {
    expect(functionName("Прогнати тести!")).toBe("");
  });

  it("keeps a name to the length every provider takes", () => {
    expect(functionName("a".repeat(COMMAND_NAME_MAX_LENGTH + 10)).length).toBe(COMMAND_NAME_MAX_LENGTH);
  });
});
