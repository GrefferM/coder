import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useFocusLetGo } from "./use-focus-let-go";

/** Puts an element of the tag into the page and focuses it. */
function focused(tag: "button" | "textarea") {
  const element = document.createElement(tag);

  document.body.append(element);
  element.focus();

  return element;
}

describe("useFocusLetGo", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("takes the focus off a pressed button as the panel hides", () => {
    renderHook(() => useFocusLetGo());

    const button = focused("button");

    window.dispatchEvent(new Event("blur"));

    expect(document.activeElement).not.toBe(button);
  });

  it("leaves the field its focus", () => {
    renderHook(() => useFocusLetGo());

    const field = focused("textarea");

    window.dispatchEvent(new Event("blur"));

    expect(document.activeElement).toBe(field);
  });
});
