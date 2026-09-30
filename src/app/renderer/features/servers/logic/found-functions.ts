import type { FunctionRow } from "../interfaces";

/** Searches one server's functions by name and by the server's own description; «4 / 33» is found against total. */
export function foundFunctions(rows: FunctionRow[], typed: string): FunctionRow[] {
  const wanted = typed.trim().toLowerCase();

  if (wanted === "") {
    return rows;
  }

  return rows.filter(
    (row) => row.name.toLowerCase().includes(wanted) || row.description.toLowerCase().includes(wanted),
  );
}
