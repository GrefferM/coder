import { REFUSAL_SAID_SEPARATOR } from "../../contracts";

/**
 * A named outcome the app gives on purpose; it crosses IPC as an answer and is not reported. Extra detail (e.g. which
 * line of a file is wrong) rides in the message after the code.
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
