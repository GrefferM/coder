import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuietLine } from "./quiet-line";

describe("QuietLine", () => {
  it("says its line under a field's box, in the mark's own quiet voice", () => {
    render(<QuietLine>Закріплені параметри тут не стоять</QuietLine>);

    expect(screen.getByText("Закріплені параметри тут не стоять")).toBeInTheDocument();
  });
});
