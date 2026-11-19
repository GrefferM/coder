import { describe, expect, it } from "vitest";
import { languageSpans } from "./language-spans";

describe("languageSpans", () => {
  it("cuts an English sentence from the Ukrainian explanation after it", () => {
    const spoken = "Yesterday I went to the shop. Помилка в часі дієслів: went, а не go.";

    expect(languageSpans(spoken)).toEqual([
      {
        start: 0,
        end: 30,
        isUkrainian: false,
      },
      {
        start: 30,
        end: spoken.length,
        isUkrainian: true,
      },
    ]);
  });

  it("keeps an English phrase inside a Ukrainian sentence, and joins sentences of one language", () => {
    const spoken = "Кава з собою — coffee to go. Так кажуть у кав'ярні.";

    expect(languageSpans(spoken)).toEqual([
      {
        start: 0,
        end: spoken.length,
        isUkrainian: true,
      },
    ]);
  });
});
