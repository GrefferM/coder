import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LostTie } from "./lost-tie";
import { LOST_TIE_LABEL } from "./constants";

describe("LostTie", () => {
  it("names the loss, says what is gone, and stands the ties themselves under it", () => {
    // A lost tie: its own group, in the broken colour.
    render(
      <LostTie note="Промпт, на якому стояв агент, видалено з проєкту">
        <span>Редактор</span>
      </LostTie>,
    );

    expect(screen.getByText(LOST_TIE_LABEL)).toBeInTheDocument();
    expect(screen.getByText("Промпт, на якому стояв агент, видалено з проєкту")).toBeInTheDocument();
    expect(screen.getByText("Редактор")).toBeInTheDocument();
  });

  it("offers to take the tie off where taking it off is the way out", () => {
    const onRemove = vi.fn();

    render(
      <LostTie note="Промпт видалено" removeLabel="ПРИБРАТИ ПРОМПТ" onRemove={onRemove}>
        <span>Редактор</span>
      </LostTie>,
    );

    screen.getByText("ПРИБРАТИ ПРОМПТ").click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("offers nothing where the only way out is choosing another thing in the field above", () => {
    render(
      <LostTie note="Моделі більше немає">
        <span>hy-mt2</span>
      </LostTie>,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
