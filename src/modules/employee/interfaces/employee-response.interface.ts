import { Department } from '../../department/entities/department.entity';
import { Timekeeping } from '../../timekeeping/entities/timekeeping.entity';
import { Role } from '../../../common/enums/role.enum';

export interface EmployeeResponse {
  id: string;
  fullName?: string;
  avatar?: string;
  phoneNumber?: string;
  email: string;
  birthDate?: Date;
  isActive?: boolean;
  isAdmin?: boolean;
  departmentId?: string;
  role: Role;
}
