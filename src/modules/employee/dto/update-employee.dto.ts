import { IsString, IsPhoneNumber, IsDateString, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
