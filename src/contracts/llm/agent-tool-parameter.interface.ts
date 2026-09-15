/** One thing the model fills in when it calls a command; `values` is filled for an `enum` alone. */
export interface AgentToolParameter {
  name: string;
  description: string;
  type: "text" | "number" | "bool" | "enum";
  isRequired: boolean;
  values: string[];
}
