import { McpSignIn } from "../interfaces";

/** Every way into a server the file may name; a local server signs in to nothing and carries `none`. */
export const MCP_SIGN_INS: McpSignIn[] = ["none", "token", "browser"];
