import { Controller, Post, Body, Get, Param, Query, UseGuards, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { TimekeepingService } from './timekeeping.service';
import { CreateTimekeepingDto } from './dto/create-timekeeping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { exec } from 'child_process';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Controller('timekeeping')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimekeepingController {
  constructor(private readonly timekeepingService: TimekeepingService) {}

  @Post('check-in')
  checkIn(
    @Body() createTimekeepingDto: CreateTimekeepingDto,
    @CurrentUser() user: any,
  ) {

    if (createTimekeepingDto.employeeId !== user.id && !user.isAdmin) {
      throw new ForbiddenException('You can only check in for yourself');
    }
    
    return this.timekeepingService.checkIn(createTimekeepingDto);
  }

  @Post('check-out/:id')
  @Roles(Role.USER)
  async checkOut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('checkOutTime') checkOutTime: string,
    @CurrentUser() user: any,
  ) {
    return this.timekeepingService.checkOut(id, checkOutTime, user.id);
  }

  @Post('checkin/qr')
  @Roles(Role.USER)
  async checkInWithQR(
    @Query('token') token: string,
    @CurrentUser() user: any,
  ) {
    return this.timekeepingService.checkInWithQR(token, user.id);
  }

  @Post('checkout/qr')
  @Roles(Role.USER)
  async checkOutWithQR(
    @Query('token') token: string,
    @CurrentUser() user: any,
  ) {
    return this.timekeepingService.checkOutWithQR(token, user.id);
  }

  @Get('employee/:employeeId')
  // @Roles('admin', 'self')
  findByEmployee(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    // @CurrentUser() user: any,
  ) {
    // Comment out authentication check temporarily
    // if (employeeId !== user.id && !user.isAdmin) {
    //   throw new Error('You can only view your own records');
    // }
    console.log(employeeId, startDate, endDate);  
    return this.timekeepingService.findByEmployeeAndDateRange(
      employeeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('department/:departmentId')
  // @Roles('admin')
  findByDepartment(
    @Param('departmentId', ParseUUIDPipe) departmentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.timekeepingService.findByDepartmentAndDateRange(
      departmentId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('department')
  @Roles(Role.MANAGER)
  async getDepartmentHistory(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timekeepingService.getDepartmentHistory(user.departmentId, startDate, endDate);
  }

  @Get('employee/:employeeId')
  @Roles(Role.MANAGER)
  async getEmployeeHistory(
    @CurrentUser() user: any,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timekeepingService.getEmployeeHistory(employeeId, user.departmentId, startDate, endDate);
  }

  @Get('history')
  @Roles(Role.USER)
  async getPersonalHistory(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timekeepingService.getPersonalHistory(user.id, startDate, endDate);
  }
}
