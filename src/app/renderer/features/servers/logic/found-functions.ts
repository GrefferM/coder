import type { FunctionRow } from "../interfaces";

/**
 * The search over one server's functions — «4 / 33» is what it found against what there is. It looks in
 * the name and in the server's own words about it, because a person searching «пул-реквест» is searching the
 * sentence and not the name they do not know yet.
 */
export function foundFunctions(rows: FunctionRow[], typed: string): FunctionRow[] {
  const wanted = typed.trim().toLowerCase();

  if (wanted === "") {
    return rows;
  }

  return rows.filter(
    (row) => row.name.toLowerCase().includes(wanted) || row.description.toLowerCase().includes(wanted),
  );
}
