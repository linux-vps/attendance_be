import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EmployeeService } from '../../employee/employee.service';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private employeeService: EmployeeService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'), // Use environment variable in production
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const employee = await this.employeeService.findOne(payload.sub);
      if (!employee || !employee.isActive) {
        throw new UnauthorizedException('Employee not found or deactivated');
      }
      
      return {
        id: employee.id,
        role: employee.role.toLowerCase(),
        departmentId: employee.departmentId ?? undefined,
      };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}
