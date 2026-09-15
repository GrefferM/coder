/** An argument fixed per agent; the model never sees it, so its parameter leaves the schema. */
export interface PinnedArgument {
  id: string;
  parameterId: string;
  value: string;
}
