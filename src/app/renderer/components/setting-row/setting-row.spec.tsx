import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingRow } from "./setting-row";
import { SETTING_ROW_BORDER_COLOR } from "./constants";
import { FIELD_SLOT_CHANGED_BORDER_COLOR, FIELD_SLOT_WAS_PREFIX } from "../field-slot/constants";

describe("SettingRow", () => {
  it("names the setting and stands whatever is set beside the name", () => {
    render(
      <SettingRow label="МАКСИМУМ ВИКЛИКІВ">
        <button type="button">10</button>
      </SettingRow>,
    );

    expect(screen.getByText("МАКСИМУМ ВИКЛИКІВ")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("10");
  });

  it("says what the setting was, and steps its edge, while the draft has moved it", () => {
    // The three draft marks: a dot at the name, a stepped edge, «БУЛО · …» under the row.
    render(
      <SettingRow label="ТЕМПЕРАТУРА" wasValue="0.3">
        <button type="button">0.7</button>
      </SettingRow>,
    );

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}0.3`)).toBeInTheDocument();
    expect(screen.getByText("ТЕМПЕРАТУРА").closest("div")).toHaveStyle({
      border: `1px solid ${FIELD_SLOT_CHANGED_BORDER_COLOR}`,
    });
  });

  it("keeps its own edge and says nothing where the setting stands as it was saved", () => {
    render(
      <SettingRow label="ТЕМПЕРАТУРА">
        <button type="button">0.3</button>
      </SettingRow>,
    );

    expect(
      screen.queryByText(FIELD_SLOT_WAS_PREFIX, {
        exact: false,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("ТЕМПЕРАТУРА").closest("div")).toHaveStyle({
      border: `1px solid ${SETTING_ROW_BORDER_COLOR}`,
    });
  });

  it("carries a hint under the row where the numbers need saying in words", () => {
    // A hint line under the row.
    render(
      <SettingRow label="ТЕМПЕРАТУРА" hint="0 — та сама відповідь щоразу">
        <button type="button">0.3</button>
      </SettingRow>,
    );

    expect(screen.getByText("0 — та сама відповідь щоразу")).toBeInTheDocument();
  });
});
