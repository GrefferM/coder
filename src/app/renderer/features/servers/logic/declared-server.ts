import type { ProjectMcpServer } from "../../../interfaces";
import type { ServerFormValues } from "../interfaces";

/**
 * What the project file holds for one kind of server: only that kind's fields are filled, the other kind's are empty
 * rather than absent. A remote server signs in by token or not at all (`none`); a local one signs in to nothing.
 */
export function declaredServer(values: ServerFormValues): Omit<ProjectMcpServer, "id"> {
  const name = values.name.trim();

  return values.isLocal
    ? {
        name,
        isLocal: true,
        run: values.run.trim(),
        address: "",
        signIn: "none",
        env: values.env,
      }
    : {
        name,
        isLocal: false,
        run: "",
        address: values.address.trim(),
        signIn: values.signIn,
        env: [],
      };
}
