/** How a declared parameter's type reads in the schema handed to the model. */
export const TOOL_SCHEMA_TYPES: Record<string, string> = {
  text: "string",
  number: "number",
  bool: "boolean",
  enum: "string",
};
export const TOOL_SCHEMA_OBJECT = "object";
export const TOOL_SCHEMA_ARRAY = "array";
