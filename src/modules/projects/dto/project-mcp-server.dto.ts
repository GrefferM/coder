import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsString, IsUUID, Matches } from "class-validator";
import { MCP_SIGN_INS } from "../constants";
import { McpSignIn } from "../interfaces";
import { COMMAND_NAME_PATTERN } from "../../../contracts";

/**
 * One MCP server the project declares — only how to reach it. Everything that moves is live and written to no
 * file, and a token never stands here: it goes to this machine's keychain.
 */
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

  /** The names of the environment variables the process is started with, and the names alone. */
  @IsArray()
  @IsString({
    each: true,
  })
  @Matches(COMMAND_NAME_PATTERN, {
    each: true,
  })
  declare env: string[];
}
