import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DepartmentService } from '../department/department.service';
import { Role } from '../../common/enums/role.enum';
@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private departmentService: DepartmentService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const department = await this.departmentService.findOne(createEmployeeDto.departmentId);
    
    // Check if email exists
    const existingEmployee = await this.employeeRepository.findOne({
      where: { email: createEmployeeDto.email }
    });
    if (existingEmployee) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      password: hashedPassword,
      department,
    });

    return await this.employeeRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find({
      where: { isActive: true },
      relations: ['department'],
    });
  }

  async findByDepartment(departmentId: string): Promise<Employee[]> {
    return await this.employeeRepository.find({
      where: { 
        department: { id: departmentId },
        isActive: true
      },
      relations: ['department'],
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ 
      where: { id },
      relations: ['department']
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findOneInDepartment(id: string, departmentId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { 
        id,
        department: { id: departmentId }
      },
      relations: ['department']
    });

    if (!employee) {
      throw new NotFoundException('Employee not found in this department');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    
    Object.assign(employee, updateEmployeeDto);
    
    return await this.employeeRepository.save(employee);
  }

  async updateInDepartment(id: string, updateEmployeeDto: UpdateEmployeeDto, departmentId: string): Promise<Employee> {
    const employee = await this.findOneInDepartment(id, departmentId);
    
    Object.assign(employee, updateEmployeeDto);
    
    return await this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }

  async deactivate(id: string): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.isActive = false;
    return await this.employeeRepository.save(employee);
  }

  async deactivateInDepartment(id: string, departmentId: string): Promise<Employee> {
    const employee = await this.findOneInDepartment(id, departmentId);
    employee.isActive = false;
    return await this.employeeRepository.save(employee);
  }

  async activate(id: string): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.isActive = true;
    return await this.employeeRepository.save(employee);
  }

  async activateInDepartment(id: string, departmentId: string): Promise<Employee> {
    const employee = await this.findOneInDepartment(id, departmentId);
    employee.isActive = true;
    return await this.employeeRepository.save(employee);
  }

  async findByRole(role: Role): Promise<Employee[]> {
    return await this.employeeRepository.find({
      where: { 
        role,
        isActive: true 
      },
      relations: ['department'],
    });
  }

  async findByRoleInDepartment(role: Role, departmentId: string): Promise<Employee[]> {
    return await this.employeeRepository.find({
      where: { 
        role,
        department: { id: departmentId },
        isActive: true
      },
      relations: ['department'],
    });
  }
}
