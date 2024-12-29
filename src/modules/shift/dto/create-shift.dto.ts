import { IsNotEmpty, IsString, Matches, IsOptional, IsUUID } from 'class-validator';

export class CreateShiftDto {

  @IsNotEmpty()
  @IsString()
  shiftName: string;

  @IsNotEmpty()
  @Matches(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    { message: 'startTime phải ở định dạng HH:mm (00:00 - 23:59)' },
  )
  startTime: string;

  @IsNotEmpty()
  @Matches(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    { message: 'endTime phải ở định dạng HH:mm (00:00 - 23:59)' },
  )
  endTime: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
