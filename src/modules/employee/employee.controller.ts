import { Controller, Get, Post, Body, Param, Delete, UseGuards, Logger, Patch, ParseUUIDPipe } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UnauthorizedException } from '@nestjs/common';

@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name);

  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(@Body() createEmployeeDto: CreateEmployeeDto, @CurrentUser() user: any) {
    this.logger.log('Bắt đầu tạo nhân viên mới');
    this.logger.log(`User hiện tại: ${JSON.stringify(user)}`);
    this.logger.log(`Data nhận được: ${JSON.stringify(createEmployeeDto)}`);

    // Admin có thể tạo mọi nhân viên và phải chỉ định departmentId
    if (user.role === Role.ADMIN) {
      this.logger.log('Người dùng là ADMIN, cho phép tạo mọi loại nhân viên');
      return this.employeeService.create(createEmployeeDto);
    }
    
    // Manager chỉ có thể tạo USER trong phòng ban của mình
    if (user.role === Role.MANAGER) {
      this.logger.log('Người dùng là MANAGER');
      this.logger.log(`Department của manager: ${user.departmentId}`);

      if (createEmployeeDto.role && createEmployeeDto.role !== Role.USER) {
        this.logger.warn(`Manager cố gắng tạo tài khoản ${createEmployeeDto.role}`);
        throw new UnauthorizedException('Quản lý chỉ có thể tạo tài khoản USER');
      }
      
      // Tự động gán department của manager cho user mới
      const modifiedDto = {
        ...createEmployeeDto,
        departmentId: user.departmentId,
        role: Role.USER
      };
      
      this.logger.log(`Data sau khi modify: ${JSON.stringify(modifiedDto)}`);
      return this.employeeService.create(modifiedDto);
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@CurrentUser() user: any) {
    if(user.role === Role.ADMIN) {
      return this.employeeService.findByRole(Role.MANAGER);
    }
    if (user.role === Role.MANAGER) {
      return this.employeeService.findByRoleInDepartment(Role.USER, user.departmentId);
    }
    return this.employeeService.findByRole(Role.USER);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    if (user.role === Role.MANAGER && user.departmentId) {
      return this.employeeService.findOneInDepartment(id, user.departmentId);
    }
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @CurrentUser() user: any,
  ) {
    if (user.role === Role.MANAGER) {
      return this.employeeService.updateInDepartment(id, updateEmployeeDto, user.departmentId);
    }
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.remove(id);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN, Role.MANAGER)
  async deactivate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    if (user.role === Role.MANAGER) {
      return this.employeeService.deactivateInDepartment(id, user.departmentId);
    }
    return this.employeeService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN, Role.MANAGER)
  async activate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    if (user.role === Role.MANAGER) {
      return this.employeeService.activateInDepartment(id, user.departmentId);
    }
    return this.employeeService.activate(id);
  }
}
