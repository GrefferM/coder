import type { ProjectMcpServer } from "../../../interfaces";
import type { ServerFormValues } from "../interfaces";

/**
 * What the project file holds for one kind of server. The switch in the head of the form says
 * which kind this is, and only that kind's truth is written: the other half of the form keeps whatever was typed
 * in it — switching back must cost nothing — but the file holds the other kind's fields **empty rather than
 * absent**, because one shape reads either way round.
 *
 * A remote server may be signed in to by a token, through the browser, or not at all: a public one exists, and
 * `none` is what the file calls that. A local server signs in to nothing either way.
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
