import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WriteNote } from "./write-note";
import { WRITE_NOTE_MS, WRITE_NOTE_OUT_MS, WRITE_NOTE_RETRY_LABEL } from "./constants";

afterEach(() => {
  vi.useRealTimers();
});

describe("WriteNote", () => {
  it("says what was written, and takes itself off once it has been read", () => {
    vi.useFakeTimers();

    const onDismiss = vi.fn();

    render(
      <WriteNote
        note={{
          label: "Агента збережено",
          detail: null,
          reason: null,
        }}
        onRetry={() => {}}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText("Агента збережено")).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(WRITE_NOTE_MS + WRITE_NOTE_OUT_MS);
    });

    expect(onDismiss).toHaveBeenCalled();
  });

  it("names what stopped a write, and waits — a failure is not read in passing", () => {
    vi.useFakeTimers();

    const onDismiss = vi.fn();
    const onRetry = vi.fn();

    render(
      <WriteNote
        note={{
          label: "Агента збережено",
          detail: null,
          reason: "Не збереглося · немає доступу до файла",
        }}
        onRetry={onRetry}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText("Не збереглося · немає доступу до файла")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(WRITE_NOTE_MS * 4);
    });

    // Nothing takes a failure away by itself: «ще раз» is the only way out of it.
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(WRITE_NOTE_RETRY_LABEL));

    expect(onRetry).toHaveBeenCalled();
  });

  it("offers «ще раз» only where there is something to try again", () => {
    render(
      <WriteNote
        note={{
          label: "Промпт збережено",
          detail: null,
          reason: null,
        }}
        onRetry={() => {}}
        onDismiss={() => {}}
      />,
    );

    expect(screen.queryByText(WRITE_NOTE_RETRY_LABEL)).not.toBeInTheDocument();
  });
});
