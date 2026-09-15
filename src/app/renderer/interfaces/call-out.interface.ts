/**
 * What one agent has out this moment, as the canvas needs it — a name to say and the порода it
 * came from. A server's call is said by the **server's** name and never by the function's: «дуга каже, звідки
 * озброєння, а котра саме функція — це вже сторінка».
 */
export interface CallOut {
  /** The command's own name, or the server's — never a server's function. */
  name: string;
  /** Which colour the pill wears, and it is the source's, never the agent's. */
  isCommand: boolean;
}
