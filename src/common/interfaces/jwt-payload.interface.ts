import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;
  role: string;
  departmentId?: string;
  iat?: number;
  exp?: number;
}
