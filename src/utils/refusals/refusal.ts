import { REFUSAL_SAID_SEPARATOR } from "../../contracts";

/**
 * A named outcome the app knows how to give; it crosses IPC as an answer and is reported nowhere.
 *
 * Some refusals have one thing more to say than their name — which line of a file is wrong, say. It rides in
 * the message after the code, because the message is all that survives the crossing, and the screen that names
 * the code in its own sentence takes it from there.
 */
export class Refusal extends Error {
  constructor(
    readonly code: string,
    readonly said = "",
  ) {
    super(said === "" ? code : `${code}${REFUSAL_SAID_SEPARATOR}${said}`);
    this.name = "Refusal";
  }
}
