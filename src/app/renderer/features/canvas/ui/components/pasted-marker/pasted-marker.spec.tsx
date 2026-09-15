import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PastedMarker } from "./pasted-marker";
import { CANVAS_PASTED_PREFIX, CANVAS_PASTED_SEPARATOR, CANVAS_PASTED_SUFFIX } from "../../../constants";

describe("PastedMarker", () => {
  it("names the sphere the copy was taken from", () => {
    // The mark says whose copy this is, until the next act on the canvas takes it away.
    render(
      <PastedMarker
        sourceName="Шукач"
        at={{
          x: 120,
          y: 80,
        }}
      />,
    );

    expect(
      screen.getByText(`${CANVAS_PASTED_PREFIX} Шукач${CANVAS_PASTED_SEPARATOR}${CANVAS_PASTED_SUFFIX}`),
    ).toBeInTheDocument();
  });

  it("stands at the place the copy was put down", () => {
    const { container } = render(
      <PastedMarker
        sourceName="Шукач"
        at={{
          x: 120,
          y: 80,
        }}
      />,
    );
    const [ring] = Array.from(container.querySelectorAll("span"));

    expect(ring).toHaveStyle({
      left: "120px",
      top: "80px",
    });
  });
});
