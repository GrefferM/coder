import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeletedPlace } from "./deleted-place";
import { DELETED_PLACE_SIZE_PX } from "./constants";

describe("DeletedPlace", () => {
  it("holds the sphere's own place, at the sphere's own size", () => {
    const { container } = render(
      <DeletedPlace
        at={{
          x: 300,
          y: 200,
        }}
      />,
    );
    const ring = container.firstElementChild;

    expect(ring).toHaveStyle({
      left: "300px",
      top: "200px",
      width: `${DELETED_PLACE_SIZE_PX}px`,
      height: `${DELETED_PLACE_SIZE_PX}px`,
    });
  });
});
