import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RightClickHint } from "./right-click-hint";
import { CANVAS_EMPTY_NOTE_LINES, CANVAS_EMPTY_TITLE } from "../../../constants";

describe("RightClickHint", () => {
  it("says on an empty canvas what to do with it, and where the sphere will stand", () => {
    render(<RightClickHint />);

    expect(screen.getByText(CANVAS_EMPTY_TITLE)).toBeInTheDocument();

    for (const line of CANVAS_EMPTY_NOTE_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });
});
