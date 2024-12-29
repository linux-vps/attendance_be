import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { EmployeeResponse } from '../employee/interfaces/employee-response.interface';
import { Role } from '../../common/enums/role.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { password, ...rest } = registerDto;
    
    // Check if email already exists
    const existingEmployee = await this.employeeRepository.findOne({
      where: { email: registerDto.email },
    });
    
    if (existingEmployee) {
      throw new UnauthorizedException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee
    const employee = this.employeeRepository.create({
      ...rest,
      password: hashedPassword,
      role: registerDto.role || Role.USER,
    });

    await this.employeeRepository.save(employee);

    const { password: _, ...result } = employee;
    return result;
  }

  async validateEmployee(email: string, password: string): Promise<EmployeeResponse> {
    const employee = await this.employeeRepository.findOne({
      where: { email },
    });

    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = employee;
    return {
      ...result,
      role: employee.role,
      departmentId: employee.departmentId,
    };
  }

  async login(employee: EmployeeResponse) {
    const payload: JwtPayload = {
      sub: employee.id,
      role: employee.role,
      departmentId: employee.departmentId,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      employee,
    };
  }
}