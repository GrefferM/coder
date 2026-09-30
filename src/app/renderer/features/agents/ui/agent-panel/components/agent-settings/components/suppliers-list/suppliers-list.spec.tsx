import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SuppliersList } from "./suppliers-list";
import {
  SUPPLIERS_COUNT_SEPARATOR,
  SUPPLIERS_LABEL,
  SUPPLIERS_OF_SEPARATOR,
  SUPPLIER_LIVE_LABEL,
  SUPPLIER_OFF_LABEL,
} from "./constants";
import type { Agent } from "../../../../../../../../interfaces";
import { anAgent } from "../../../../../../../../testing";

function agent(patch: Partial<Agent> = {}): Agent {
  return anAgent({
    x: 0,
    y: 0,
    ...patch,
  });
}

describe("SuppliersList", () => {
  it("names everyone work can come from", () => {
    render(
      <SuppliersList
        suppliers={[
          agent(),
          agent({
            id: "agent-2",
            name: "Перелікар",
          }),
        ]}
      />,
    );

    expect(screen.getByText("Шукач")).toBeInTheDocument();
    expect(screen.getByText("Перелікар")).toBeInTheDocument();
  });

  it("counts the living alone where somebody is off, and plainly where all are living", () => {
    // An off supplier stays listed, since its line is still drawn, but is not counted.
    const { rerender } = render(
      <SuppliersList
        suppliers={[
          agent(),
          agent({
            id: "agent-2",
          }),
        ]}
      />,
    );

    expect(screen.getByText(`${SUPPLIERS_LABEL}${SUPPLIERS_COUNT_SEPARATOR}2`)).toBeInTheDocument();

    rerender(
      <SuppliersList
        suppliers={[
          agent(),
          agent({
            id: "agent-2",
            isActive: false,
          }),
        ]}
      />,
    );

    expect(
      screen.getByText(`${SUPPLIERS_LABEL}${SUPPLIERS_COUNT_SEPARATOR}1${SUPPLIERS_OF_SEPARATOR}2`),
    ).toBeInTheDocument();
  });

  it("says of each supplier whether it is living or off", () => {
    render(
      <SuppliersList
        suppliers={[
          agent(),
          agent({
            id: "agent-2",
            name: "Перелікар",
            isActive: false,
          }),
        ]}
      />,
    );

    expect(screen.getByText(SUPPLIER_LIVE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(SUPPLIER_OFF_LABEL)).toBeInTheDocument();
  });
});
