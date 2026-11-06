import { CODE_BLOCK, CODE_PAUSE } from "./constants";

/** The words of an answer as they are read aloud: every fenced block of code left out, a pause in its place. */
export function spokenText(text: string): string {
  return text.replace(CODE_BLOCK, CODE_PAUSE).trim();
}
