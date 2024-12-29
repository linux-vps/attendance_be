import { IsNotEmpty, IsUUID, IsOptional, IsString, Matches } from 'class-validator';
import { IsTime } from '../../../common/decorators/is-time.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimekeepingDto {
  @ApiProperty({
    description: 'Employee ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    description: 'Check-in time in HH:mm format',
    example: '09:00'
  })
  @IsNotEmpty()
  @IsTime()
  checkInTime: string;

  @ApiProperty({
    description: 'Shift ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsUUID()
  shiftId: string;

  @IsOptional()
  @IsTime()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
