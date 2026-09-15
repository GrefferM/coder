/** One prompt in the open project's library, its body already read from its own file. */
export interface ProjectPrompt {
  id: string;
  name: string;
  file: string;
  text: string;
}
