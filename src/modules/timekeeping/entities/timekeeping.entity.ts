import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { Shift } from '../../shift/entities/shift.entity';

@Entity()
export class Timekeeping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  date: Date;

  @Column({ type: 'time' })
  checkInTime: string;

  @Column({ type: 'time', nullable: true })
  checkOutTime?: string;

  @Column({ default: false })
  isLate?: boolean;

  @Column({ default: false })
  isEarlyLeave?: boolean;

  @Column({ nullable: true })
  note?: string;

  @ManyToOne(() => Employee, (employee) => employee.timekeepings)
  employee: Employee;

  @ManyToOne(() => Shift, (shift) => shift.timekeepings)
  shift: Shift;
}
