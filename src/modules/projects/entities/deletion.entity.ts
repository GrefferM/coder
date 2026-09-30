import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DELETION_TABLE_NAME } from "../constants";
import { DeletionRecord } from "../interfaces";

/** A row of `deletions`: one deletion in one project, with everything it took. */
@Entity(DELETION_TABLE_NAME)
export class DeletionEntity implements DeletionRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Absolute path of the project's folder on this machine.
  @Column({
    type: "varchar",
  })
  declare directory: string;

  @Column({
    type: "varchar",
  })
  declare kind: string;

  @Column({
    type: "varchar",
  })
  declare name: string;

  // Everything the deletion took, as JSON; never opened here.
  @Column({
    type: "text",
  })
  declare body: string;

  @Column({
    type: "datetime",
  })
  declare takenAt: Date;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}
