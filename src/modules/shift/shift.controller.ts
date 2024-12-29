import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForbiddenException } from '@nestjs/common';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() createShiftDto: CreateShiftDto, @CurrentUser() user: any) {
    if (user.role === Role.MANAGER) {
      return this.shiftService.createForDepartment(createShiftDto, user.departmentId);
    }
    return this.shiftService.create(createShiftDto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    if (user.role === Role.MANAGER) {
      return this.shiftService.findByDepartment(user.departmentId);
    }
    return this.shiftService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.USER)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const shift = await this.shiftService.findOne(id);
    if (user.role === Role.MANAGER && shift.departmentId !== user.departmentId) {
      throw new ForbiddenException('You do not have access to this shift');
    }
    return shift;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @CurrentUser() user: any
  ) {
    if (user.role === Role.MANAGER) {
      const shift = await this.shiftService.findOne(id);
      if (shift.departmentId !== user.departmentId) {
        throw new ForbiddenException('You do not have access to this shift');
      }
    }
    return this.shiftService.update(id, updateShiftDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    if (user.role === Role.MANAGER) {
      const shift = await this.shiftService.findOne(id);
      if (shift.departmentId !== user.departmentId) {
        throw new ForbiddenException('You do not have access to this shift');
      }
    }
    return this.shiftService.remove(id);
  }
}
