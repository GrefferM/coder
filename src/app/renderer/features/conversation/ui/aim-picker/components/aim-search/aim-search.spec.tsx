import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AimSearch } from "./aim-search";
import { AIM_PICKER_SEARCH_PLACEHOLDER } from "../../constants";

describe("AimSearch", () => {
  it("takes what is being hunted for, letter by letter", async () => {
    const onAsk = vi.fn();

    render(<AimSearch asked="Шука" onAsk={onAsk} onKeyDown={() => {}} />);

    const field = screen.getByLabelText(AIM_PICKER_SEARCH_PLACEHOLDER);

    expect(field).toHaveValue("Шука");

    await userEvent.type(field, "ч");

    expect(onAsk).toHaveBeenCalledWith("Шукач");
  });

  it("hands its keys straight back to the list, the arrows being the list's own", async () => {
    // The letters stay in the field while the arrows walk the rows.
    const onKeyDown = vi.fn();

    render(<AimSearch asked="" onAsk={() => {}} onKeyDown={onKeyDown} />);
    await userEvent.type(screen.getByLabelText(AIM_PICKER_SEARCH_PLACEHOLDER), "{ArrowDown}");

    expect(onKeyDown).toHaveBeenCalled();
  });
});
