import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fieldWord } from "./field-word";
import { AGENT_FIELD_TEMPERATURE, MODEL_FIELD_ANSWER_CEILING, MODEL_FIELD_INPUT_PRICE } from "../../../contracts";

describe("fieldWord", () => {
  it("takes a field's name back into plain speech, since the caps belong to the pill's row", () => {
    assert.equal(fieldWord(MODEL_FIELD_ANSWER_CEILING), "Стеля відповіді");
    assert.equal(fieldWord(MODEL_FIELD_INPUT_PRICE), "Вхідна ціна");
  });

  it("leaves a one-word name a one-word name", () => {
    assert.equal(fieldWord(AGENT_FIELD_TEMPERATURE), "Температура");
  });
});
