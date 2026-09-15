/** A channel's answer: `value` is the handler's return, `refusal` a named outcome, `failure` a logged fault. */
export interface IpcAnswer {
  value: unknown;
  refusal: string | null;
  failure: string | null;
}
