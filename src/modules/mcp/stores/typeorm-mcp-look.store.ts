import { McpServerLookEntity } from "../entities";
import type { Repository } from "typeorm";
import type { McpLookMemory, McpLookStore } from "../interfaces";

export class TypeormMcpLookStore implements McpLookStore {
  constructor(private readonly looks: Repository<McpServerLookEntity>) {}

  async of(serverId: string): Promise<McpLookMemory | null> {
    const held = await this.looks.findOne({
      where: {
        serverId,
      },
    });

    return held === null
      ? null
      : {
          ...held,
          names: <string[]>JSON.parse(held.names),
        };
  }

  async put(memory: McpLookMemory): Promise<void> {
    await this.looks.save({
      ...memory,
      names: JSON.stringify(memory.names),
    });
  }
}
