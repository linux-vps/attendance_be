import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Timekeeping } from '../../timekeeping/entities/timekeeping.entity';
import { Department } from '../../department/entities/department.entity';

@Entity()
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shiftName: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @OneToMany(() => Timekeeping, (timekeeping) => timekeeping.shift)
  timekeepings: Timekeeping[];
}
