import { describe, expect, it } from "vitest";
import { fieldWord } from "./field-word";
import { AGENT_FIELD_TEMPERATURE, MODEL_FIELD_ANSWER_CEILING, MODEL_FIELD_INPUT_PRICE } from "../../../constants";

describe("fieldWord", () => {
  it("takes a field's name back into plain speech, since the caps belong to the pill's row", () => {
    expect(fieldWord(MODEL_FIELD_ANSWER_CEILING)).toBe("Стеля відповіді");
    expect(fieldWord(MODEL_FIELD_INPUT_PRICE)).toBe("Вхідна ціна");
  });

  it("leaves a one-word name a one-word name", () => {
    expect(fieldWord(AGENT_FIELD_TEMPERATURE)).toBe("Температура");
  });
});
