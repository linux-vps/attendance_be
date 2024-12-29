import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Employee } from '../employee/entities/employee.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from '../employee/employee.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    EmployeeModule,
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
