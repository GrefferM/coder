import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsString, IsUUID, Matches } from "class-validator";
import { MCP_SIGN_INS } from "../constants";
import { McpSignIn } from "../interfaces";
import { COMMAND_NAME_PATTERN } from "../../../contracts";

/** Only how to reach the server; a token goes to this machine's secrets, never here. */
export class ProjectMcpServerDto {
  @IsUUID()
  declare id: string;

  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsBoolean()
  declare isLocal: boolean;

  // The line that starts a local server; empty for a remote one.
  @IsString()
  declare run: string;

  // The address a remote server answers at; empty for a local one.
  @IsString()
  declare address: string;

  @IsIn(MCP_SIGN_INS)
  declare signIn: McpSignIn;

  /** The environment variables the process starts with, names only. */
  @IsArray()
  @IsString({
    each: true,
  })
  @Matches(COMMAND_NAME_PATTERN, {
    each: true,
  })
  declare env: string[];
}
