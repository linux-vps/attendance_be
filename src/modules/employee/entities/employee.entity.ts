import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { Timekeeping } from '../../timekeeping/entities/timekeeping.entity';
import { Role } from '../../../common/enums/role.enum';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: false })
  email: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ default: true })
  isActive?: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
    nullable: false
  })
  role: Role;

  @Column({ nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, (department) => department.employees, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @OneToMany(() => Timekeeping, (timekeeping) => timekeeping.employee, { nullable: true })
  timekeepings?: Timekeeping[];
}
