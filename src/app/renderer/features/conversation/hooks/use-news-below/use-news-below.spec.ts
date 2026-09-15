import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNewsBelow } from "./use-news-below";

describe("useNewsBelow", () => {
  it("counts nothing while the person stands at the end, everything there being read", () => {
    const { result, rerender } = renderHook(({ arrived }) => useNewsBelow(arrived, true, "Шукач"), {
      initialProps: {
        arrived: 4,
      },
    });

    rerender({
      arrived: 7,
    });

    expect(result.current).toBe(0);
  });

  it("counts what arrived after the person left the end", () => {
    const { result, rerender } = renderHook(({ arrived, isAtEnd }) => useNewsBelow(arrived, isAtEnd, "Шукач"), {
      initialProps: {
        arrived: 4,
        isAtEnd: true,
      },
    });

    rerender({
      arrived: 4,
      isAtEnd: false,
    });
    rerender({
      arrived: 7,
      isAtEnd: false,
    });

    expect(result.current).toBe(3);
  });

  it("drops the count the moment the person is back at the end", () => {
    const { result, rerender } = renderHook(({ arrived, isAtEnd }) => useNewsBelow(arrived, isAtEnd, "Шукач"), {
      initialProps: {
        arrived: 4,
        isAtEnd: false,
      },
    });

    rerender({
      arrived: 7,
      isAtEnd: false,
    });
    rerender({
      arrived: 7,
      isAtEnd: true,
    });

    expect(result.current).toBe(0);
  });

  it("counts another stream from nought: what stood unread in the last one is not news in this one", () => {
    const { result, rerender } = renderHook(({ arrived, stream }) => useNewsBelow(arrived, false, stream), {
      initialProps: {
        arrived: 4,
        stream: "Шукач",
      },
    });

    rerender({
      arrived: 9,
      stream: "Тезар",
    });

    expect(result.current).toBe(0);
  });
});
