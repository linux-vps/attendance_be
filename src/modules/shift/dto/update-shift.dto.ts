import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateShiftDto {

  @IsOptional()
  @IsString()
  shiftName?: string;

  @IsOptional()
  @Matches(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    { message: 'startTime phải ở định dạng HH:mm (00:00 - 23:59)' },
  )
  startTime?: string;

  @IsOptional()
  @Matches(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    { message: 'endTime phải ở định dạng HH:mm (00:00 - 23:59)' },
  )
  endTime?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
