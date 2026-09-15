import type { CommandParameterType } from "./command-parameter-type.type";

/** One parameter of a declared command; `description` is for the model, `values` an `enum`'s options. */
export interface CommandParameter {
  id: string;
  name: string;
  type: CommandParameterType;
  description: string;
  isRequired: boolean;
  values: string[];
}
