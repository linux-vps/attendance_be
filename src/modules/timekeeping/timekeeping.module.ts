import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimekeepingService } from './timekeeping.service';
import { TimekeepingController } from './timekeeping.controller';
import { Timekeeping } from './entities/timekeeping.entity';
import { EmployeeModule } from '../employee/employee.module';
import { ShiftModule } from '../shift/shift.module';
import { QRCodeModule } from '../qrcode/qrcode.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Timekeeping]),
    EmployeeModule,
    ShiftModule,
    QRCodeModule,
  ],
  controllers: [TimekeepingController],
  providers: [TimekeepingService],
  exports: [TimekeepingService],
})
export class TimekeepingModule {}
