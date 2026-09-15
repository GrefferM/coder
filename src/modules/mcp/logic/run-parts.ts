/**
 * The line that starts a local server, split into the program and its arguments. Started as a process and not
 * through a shell — a shell would only add a way for a line to mean something other than it says — with quotes
 * honoured, because a folder with a space in its name is ordinary.
 *
 * A quote that is never closed is not a quote: an apostrophe stands in people's paths. So where honouring quotes
 * leaves one hanging, the line is split again with none.
 */
export function runParts(run: string): string[] {
  const quoted = split(run, true);

  // The second pass cannot leave a quote open, since it reads none.
  return quoted ?? <string[]>split(run, false);
}

/** One pass; nothing at all where a quote is left open and the caller must go round again. */
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
      // A quote opens a part even where nothing stands inside it: `--root ""` passes one empty argument.
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
