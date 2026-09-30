import { In } from "typeorm";
import { McpDroppedServerEntity } from "../entities";
import type { Repository } from "typeorm";
import type { McpDroppedStore } from "../interfaces";

/** The servers dropped on this machine, in its own database. */
export class TypeormMcpDroppedStore implements McpDroppedStore {
  constructor(private readonly dropped: Repository<McpDroppedServerEntity>) {}

  async all(): Promise<{ serverId: string; droppedAt: number }[]> {
    return this.dropped.find();
  }

  async put(serverId: string, droppedAt: number): Promise<void> {
    await this.dropped.save({
      serverId,
      droppedAt,
    });
  }

  async forget(serverIds: string[]): Promise<void> {
    if (serverIds.length === 0) {
      return;
    }

    await this.dropped.delete({
      serverId: In(serverIds),
    });
  }
}
