import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LostModel } from "./lost-model";
import { LOST_MODEL_NOTE } from "./constants";
import { AGENT_LOST_MODEL_NAME } from "../../../../../../constants";

describe("LostModel", () => {
  it("says the agent stands on a model the project no longer has", () => {
    // The tie is not cleared; it stands until another model is chosen.
    render(<LostModel />);

    expect(screen.getByText(LOST_MODEL_NOTE)).toBeInTheDocument();
    expect(screen.getByText(AGENT_LOST_MODEL_NAME)).toBeInTheDocument();
  });
});
