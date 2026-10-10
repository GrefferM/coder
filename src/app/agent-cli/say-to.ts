/** Writes the text and its line end to a stream, and resolves once the stream has taken it. */
export function sayTo(stream: NodeJS.WriteStream, text: string): Promise<void> {
  return new Promise((resolve) => {
    stream.write(`${text}\n`, () => resolve());
  });
}
