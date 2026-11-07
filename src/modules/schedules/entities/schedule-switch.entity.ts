import { Column, Entity, PrimaryColumn } from "typeorm";
import { SCHEDULE_SWITCH_TABLE_NAME } from "../constants";
import type { ScheduleSwitchRecord } from "../interfaces";

/** The `schedule_switches` row: one schedule this machine switched on, by the schedule's id; no row is off. */
@Entity(SCHEDULE_SWITCH_TABLE_NAME)
export class ScheduleSwitchEntity implements ScheduleSwitchRecord {
  @PrimaryColumn({
    type: "varchar",
  })
  declare scheduleId: string;

  @Column({
    type: "integer",
  })
  declare switchedOnAt: number;
}
