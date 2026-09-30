import type { Repository } from "typeorm";
import type { DeletionEntity } from "../entities";
import type { Deletion, ProjectHistory } from "../interfaces";
import type { ForgetDeletionDto, RememberDeletionDto } from "../dto";

/** Stores every deletion made in a project on this machine; the taken body is kept unopened. */
export class DeletionService implements ProjectHistory {
  constructor(private readonly deletions: Repository<DeletionEntity>) {}

  /** Records one deletion; the undo removes the row by the returned id. */
  async remember(payload: RememberDeletionDto): Promise<string> {
    const row = await this.deletions.save({
      directory: payload.directory,
      kind: payload.kind,
      name: payload.name,
      body: JSON.stringify(payload.taken),
      takenAt: new Date(),
    });

    return row.id;
  }

  /** The project's deletions, newest first. */
  async list(directory: string): Promise<Deletion[]> {
    const rows = await this.deletions.find({
      where: {
        directory,
      },
    });

    return rows
      .map((row) => this.toDeletion(row))
      .sort((one, other) => other.takenAt.getTime() - one.takenAt.getTime());
  }

  /** Hard-deletes the project's whole deletion history; the folder is untouched. */
  async forgetProject(directory: string): Promise<void> {
    await this.deletions.delete({
      directory,
    });
  }

  /** Hard-deletes one row. */
  async forget(payload: ForgetDeletionDto): Promise<void> {
    await this.deletions.delete({
      id: payload.id,
    });
  }

  private toDeletion(row: DeletionEntity): Deletion {
    return {
      id: row.id,
      kind: row.kind,
      name: row.name,
      takenAt: row.takenAt,
      taken: <Record<string, unknown>>JSON.parse(row.body),
    };
  }
}
