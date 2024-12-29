import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Timekeeping } from './entities/timekeeping.entity';
import { CreateTimekeepingDto } from './dto/create-timekeeping.dto';
import { EmployeeService } from '../employee/employee.service';
import { ShiftService } from '../shift/shift.service';
import { QRCodeService } from '../qrcode/qrcode.service';
import { QRCodeType } from '../qrcode/dto/generate-qr.dto';

@Injectable()
export class TimekeepingService {
  constructor(
    @InjectRepository(Timekeeping)
    private timekeepingRepository: Repository<Timekeeping>,
    private employeeService: EmployeeService,
    private shiftService: ShiftService,
    private qrcodeService: QRCodeService,
  ) {}

  async checkIn(createTimekeepingDto: CreateTimekeepingDto): Promise<Timekeeping> {
    const employee = await this.employeeService.findOne(createTimekeepingDto.employeeId);
    const shift = await this.shiftService.findOne(createTimekeepingDto.shiftId);

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRecord = await this.timekeepingRepository.findOne({
      where: {
        employee: { id: employee.id },
        date: Between(today, tomorrow),
      },
    });

    if (existingRecord) {
      throw new BadRequestException('Already checked in today');
    }

    // Calculate if late
    const [checkInHour, checkInMinute] = createTimekeepingDto.checkInTime.split(':').map(Number);
    const [shiftStartHour, shiftStartMinute] = shift.startTime.split(':').map(Number);
    
    const isLate = checkInHour > shiftStartHour || 
      (checkInHour === shiftStartHour && checkInMinute > shiftStartMinute);

    const timekeeping = this.timekeepingRepository.create({
      ...createTimekeepingDto,
      employee,
      shift,
      isLate,
    });

    return await this.timekeepingRepository.save(timekeeping);
  }

  async checkOut(id: string, checkOutTime: string, userId: string): Promise<Timekeeping> {
    const timekeeping = await this.timekeepingRepository.findOne({
      where: { id },
      relations: ['shift', 'employee'],
    });

    if (!timekeeping) {
      throw new NotFoundException('Timekeeping record not found');
    }

    if (timekeeping.employee.id !== userId) {
      throw new ForbiddenException('You can only check out for yourself');
    }

    // Calculate if early leave
    const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
    const [shiftEndHour, shiftEndMinute] = timekeeping.shift.endTime.split(':').map(Number);
    
    const isEarlyLeave = checkOutHour < shiftEndHour || 
      (checkOutHour === shiftEndHour && checkOutMinute < shiftEndMinute);

    timekeeping.checkOutTime = checkOutTime;
    timekeeping.isEarlyLeave = isEarlyLeave;

    return await this.timekeepingRepository.save(timekeeping);
  }

  async checkInWithQR(token: string, employeeId: string): Promise<Timekeeping> {
    if (!token) {
      throw new UnauthorizedException('Token must be provided');
    }

    if (!employeeId) {
      throw new UnauthorizedException('Employee ID must be provided');
    }

    // Xác thực token từ mã QR
    const qrData = await this.qrcodeService.verifyQRToken(token);
    
    // Kiểm tra loại QR code
    if (qrData.type !== QRCodeType.CHECKIN) {
      throw new BadRequestException('This QR code is not for check-in');
    }

    // Lấy thông tin nhân viên
    const employee = await this.employeeService.findOne(employeeId);

    // Kiểm tra xem nhân viên có thuộc phòng ban trong mã QR không
    if (employee.departmentId !== qrData.departmentId) {
      throw new UnauthorizedException('You can only check in for your department');
    }

    // Kiểm tra đã điểm danh chưa
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRecord = await this.timekeepingRepository.findOne({
      where: {
        employee: { id: employeeId },
        date: Between(today, tomorrow),
      },
    });

    if (existingRecord) {
      throw new BadRequestException('Already checked in today');
    }

    // Tạo bản ghi điểm danh
    const now = new Date();
    const timekeeping = this.timekeepingRepository.create({
      checkInTime: now.toTimeString().split(' ')[0],
      date: today,
      employee,
      shift: await this.shiftService.findOne(qrData.shiftId),
      isLate: false,
      isEarlyLeave: false,
    });

    return await this.timekeepingRepository.save(timekeeping);
  }

  async checkOutWithQR(token: string, employeeId: string): Promise<Timekeeping> {
    // Xác thực token từ mã QR
    const qrData = await this.qrcodeService.verifyQRToken(token);
    
    // Kiểm tra loại QR code
    if (qrData.type !== QRCodeType.CHECKOUT) {
      throw new BadRequestException('This QR code is not for check-out');
    }

    // Lấy thông tin nhân viên
    const employee = await this.employeeService.findOne(employeeId);

    // Kiểm tra xem nhân viên có thuộc phòng ban trong mã QR không
    if (employee.departmentId !== qrData.departmentId) {
      throw new UnauthorizedException('You can only check out for your department');
    }

    // Tìm bản ghi điểm danh của ngày hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timekeeping = await this.timekeepingRepository.findOne({
      where: {
        employee: { id: employeeId },
        date: Between(today, tomorrow),
      },
    });

    if (!timekeeping) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (timekeeping.checkOutTime) {
      throw new BadRequestException('Already checked out today');
    }

    // Cập nhật giờ check out
    timekeeping.checkOutTime = new Date().toTimeString().split(' ')[0];
    return await this.timekeepingRepository.save(timekeeping);
  }

  async findByEmployeeAndDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Timekeeping[]> {
    return await this.timekeepingRepository.find({
      where: {
        employee: { id: employeeId },
        date: Between(startDate, endDate),
      },
      relations: ['shift'],
      order: { date: 'DESC' },
    });
  }

  async findByDepartmentAndDateRange(
    departmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Timekeeping[]> {
    return await this.timekeepingRepository.find({
      where: {
        employee: { department: { id: departmentId } },
        date: Between(startDate, endDate),
      },
      relations: ['employee', 'shift'],
      order: { date: 'DESC' },
    });
  }

  async getPersonalHistory(
    employeeId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Timekeeping[]> {
    const query = this.timekeepingRepository.createQueryBuilder('timekeeping')
      .leftJoinAndSelect('timekeeping.shift', 'shift')
      .where('timekeeping.employeeId = :employeeId', { employeeId });

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.andWhere('timekeeping.date >= :start', { start });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('timekeeping.date <= :end', { end });
    }

    query.orderBy('timekeeping.date', 'DESC');

    return await query.getMany();
  }

  async getDepartmentHistory(
    departmentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Timekeeping[]> {
    const query = this.timekeepingRepository.createQueryBuilder('timekeeping')
      .leftJoinAndSelect('timekeeping.shift', 'shift')
      .leftJoinAndSelect('timekeeping.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department') // Thêm join với department
      .where('employee.departmentId = :departmentId', { departmentId });

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.andWhere('timekeeping.date >= :start', { start });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('timekeeping.date <= :end', { end });
    }

    query.orderBy('timekeeping.date', 'DESC')
      .addOrderBy('employee.fullName', 'ASC');

    return await query.getMany();
  }

  async getEmployeeHistory(
    employeeId: string,
    managerDepartmentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Timekeeping[]> {
    // First check if employee belongs to manager's department
    const employee = await this.employeeService.findOne(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.departmentId !== managerDepartmentId) {
      throw new ForbiddenException('You can only view timekeeping records of employees in your department');
    }

    const query = this.timekeepingRepository.createQueryBuilder('timekeeping')
      .leftJoinAndSelect('timekeeping.shift', 'shift')
      .leftJoinAndSelect('timekeeping.employee', 'employee')
      .where('timekeeping.employeeId = :employeeId', { employeeId });

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.andWhere('timekeeping.date >= :start', { start });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('timekeeping.date <= :end', { end });
    }

    query.orderBy('timekeeping.date', 'DESC');

    return await query.getMany();
  }
}
