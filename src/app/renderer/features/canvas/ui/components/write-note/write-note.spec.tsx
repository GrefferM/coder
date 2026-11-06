import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WriteNote } from "./write-note";
import { WRITE_NOTE_MS, WRITE_NOTE_OUT_MS, WRITE_NOTE_REFUSAL_MS, WRITE_NOTE_RETRY_LABEL } from "./constants";

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
          isRefusal: false,
          act: null,
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
          isRefusal: false,
          act: null,
        }}
        onRetry={onRetry}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText("Не збереглося · немає доступу до файла")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(WRITE_NOTE_MS * 4);
    });

    // A failure never leaves by itself; «ще раз» is the only way out.
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
          isRefusal: false,
          act: null,
        }}
        onRetry={() => {}}
        onDismiss={() => {}}
      />,
    );

    expect(screen.queryByText(WRITE_NOTE_RETRY_LABEL)).not.toBeInTheDocument();
  });

  it("says a refusal in red with nothing to try again, and leaves once it has had time to be read", () => {
    vi.useFakeTimers();

    const onDismiss = vi.fn();

    render(
      <WriteNote
        note={{
          label: "«big-repo/» не влізе",
          detail: null,
          reason: "«big-repo/» не влізе",
          isRefusal: true,
          act: null,
        }}
        onRetry={() => {}}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText("«big-repo/» не влізе")).toBeInTheDocument();
    // A refused pick would be refused again, so no «ще раз» is offered.
    expect(screen.queryByText(WRITE_NOTE_RETRY_LABEL)).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(WRITE_NOTE_MS + WRITE_NOTE_OUT_MS);
    });

    // A refusal sentence stays longer than a done note.
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(WRITE_NOTE_REFUSAL_MS);
    });

    expect(onDismiss).toHaveBeenCalled();
  });

  it("offers a refusal's own act after its words, and takes the line off once it is pressed", () => {
    const onPress = vi.fn();
    const onDismiss = vi.fn();

    render(
      <WriteNote
        note={{
          label: "Розпізнавання не налаштоване",
          detail: null,
          reason: "Розпізнавання не налаштоване",
          isRefusal: true,
          act: {
            label: "ПРОВАЙДЕРИ",
            onPress,
          },
        }}
        onRetry={() => {}}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "ПРОВАЙДЕРИ",
      }),
    );

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(WRITE_NOTE_RETRY_LABEL)).not.toBeInTheDocument();
  });
});
