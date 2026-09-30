/**
 * The line that starts a local server, split into program and arguments. Run as a process, not through a shell; quotes
 * are honoured. An unclosed quote is not a quote, so the line is then split again without quotes.
 */
export function runParts(run: string): string[] {
  const quoted = split(run, true);

  // The second pass reads no quotes, so it cannot leave one open.
  return quoted ?? <string[]>split(run, false);
}

/** One pass; `null` where a quote is left open and the caller must go round again. */
function split(run: string, honourQuotes: boolean): string[] | null {
  const parts: string[] = [];
  let standing = "";
  let isOpen = false;
  let quote = "";

  for (const letter of run.trim()) {
    if (quote !== "") {
      if (letter === quote) {
        quote = "";
      } else {
        standing += letter;
      }

      continue;
    }

    if (honourQuotes && (letter === '"' || letter === "'")) {
      // A quote opens a part even when empty: `--root ""` passes one empty argument.
      quote = letter;
      isOpen = true;

      continue;
    }

    if (letter === " " || letter === "\t") {
      if (standing !== "" || isOpen) {
        parts.push(standing);
        standing = "";
        isOpen = false;
      }

      continue;
    }

    standing += letter;
  }

  if (quote !== "") {
    return null;
  }

  if (standing !== "" || isOpen) {
    parts.push(standing);
  }

  return parts;
}
