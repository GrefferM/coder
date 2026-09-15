import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PickerShell } from "./picker-shell";
import { PICKER_SEARCH_PLACEHOLDER } from "./constants";

const ITEMS = ["EDITOR", "TESTER", "REVIEWER"];

function open(chose = vi.fn()) {
  render(
    <PickerShell
      field={<span>Оберіть</span>}
      fieldColor="#dde1ee"
      items={ITEMS}
      matches={(item, query) => item.toLowerCase().includes(query)}
      choose={(item, close) => {
        chose(item);
        close();
      }}
      row={(item, close) => (
        <button key={item} type="button" onClick={close}>
          {item}
        </button>
      )}
    />,
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /Оберіть/,
    }),
  );

  return chose;
}

/** The ring the walked row wears is the last thing its wrapper draws. */
function ringOf(name: string): string {
  const row = screen.getByRole("button", {
    name,
  });

  return (row.parentElement?.lastElementChild as HTMLElement).style.boxShadow;
}

const LEAD = "Без промпта";

function openWithLead(tookLead = vi.fn()) {
  render(
    <PickerShell
      field={<span>Оберіть</span>}
      fieldColor="#dde1ee"
      items={ITEMS}
      matches={(item, query) => item.toLowerCase().includes(query)}
      lead={{
        row: (close) => (
          <button type="button" onClick={close}>
            {LEAD}
          </button>
        ),
        choose: (close) => {
          tookLead();
          close();
        },
      }}
      row={(item, close) => (
        <button key={item} type="button" onClick={close}>
          {item}
        </button>
      )}
    />,
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: /Оберіть/,
    }),
  );

  return tookLead;
}

describe("PickerShell", () => {
  it("stands on the first row when it opens", () => {
    open();

    expect(ringOf("EDITOR")).not.toBe("");
    expect(ringOf("TESTER")).toBe("");
  });

  it("walks the rows with the arrows", () => {
    open();

    const search = screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER);

    fireEvent.keyDown(search, {
      key: "ArrowDown",
    });

    expect(ringOf("TESTER")).not.toBe("");
    expect(ringOf("EDITOR")).toBe("");
  });

  it("takes the row it stands on with Enter, and closes on it", () => {
    const chose = open();
    const search = screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER);

    fireEvent.keyDown(search, {
      key: "ArrowDown",
    });
    fireEvent.keyDown(search, {
      key: "Enter",
    });

    expect(chose).toHaveBeenCalledWith("TESTER");
    expect(
      screen.queryByRole("button", {
        name: "TESTER",
      }),
    ).not.toBeInTheDocument();
  });

  it("stands on the lead when it opens, and the items follow it", () => {
    openWithLead();

    expect(ringOf(LEAD)).not.toBe("");

    fireEvent.keyDown(screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER), {
      key: "ArrowDown",
    });

    expect(ringOf(LEAD)).toBe("");
    expect(ringOf("EDITOR")).not.toBe("");
  });

  it("takes the lead with Enter when it stands on it", () => {
    const tookLead = openWithLead();
    const search = screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER);

    fireEvent.keyDown(search, {
      key: "ArrowDown",
    });
    fireEvent.keyDown(search, {
      key: "ArrowUp",
    });
    fireEvent.keyDown(search, {
      key: "Enter",
    });

    expect(tookLead).toHaveBeenCalled();
  });

  it("walks what the search left, and takes that", () => {
    const chose = open();
    const search = screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER);

    fireEvent.change(search, {
      target: {
        value: "rev",
      },
    });
    fireEvent.keyDown(search, {
      key: "Enter",
    });

    expect(chose).toHaveBeenCalledWith("REVIEWER");
  });
});
