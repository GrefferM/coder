import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemorySection } from "./memory-section";
import { MEMORY_SECTION_HINTS, MEMORY_SECTION_LABEL } from "./constants";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../../../../../components/field-slot/constants";

describe("MemorySection", () => {
  it("heads the section, offers the three memories and says what the chosen one gives", () => {
    render(<MemorySection memory="own" wasValue={null} onMemoryChange={vi.fn()} />);

    expect(screen.getByText(MEMORY_SECTION_LABEL)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(
      screen.getByRole("radio", {
        name: "Своя",
      }),
    ).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(MEMORY_SECTION_HINTS.own)).toBeInTheDocument();
  });

  it("gives the agent the run's shared memory when that one is pressed", async () => {
    const onMemoryChange = vi.fn();

    render(<MemorySection memory="own" wasValue={null} onMemoryChange={onMemoryChange} />);
    await userEvent.click(
      screen.getByRole("radio", {
        name: "Загальна",
      }),
    );

    expect(onMemoryChange).toHaveBeenCalledWith("shared");
  });

  it("says under the track what the memory was, where the draft has moved it", () => {
    render(<MemorySection memory="shared" wasValue="своя" onMemoryChange={vi.fn()} />);

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}своя`)).toBeInTheDocument();
    expect(screen.getByText(MEMORY_SECTION_HINTS.shared)).toBeInTheDocument();
  });
});
