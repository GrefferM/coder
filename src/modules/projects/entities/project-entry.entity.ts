import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PROJECT_ENTRY_TABLE_NAME } from "../constants";
import { ProjectEntryRecord } from "../interfaces";

@Entity(PROJECT_ENTRY_TABLE_NAME)
export class ProjectEntryEntity implements ProjectEntryRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({
    type: "varchar",
  })
  declare name: string;

  // Absolute path on this machine.
  @Column({
    type: "varchar",
    unique: true,
  })
  declare directory: string;

  // What the recent list is ordered by.
  @Column({
    type: "datetime",
  })
  declare openedAt: Date;

  // Last view on this machine: canvas place and scale, open section.
  @Column({
    type: "text",
    nullable: true,
  })
  declare view: string | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @DeleteDateColumn()
  declare deletedAt?: Date;
}
