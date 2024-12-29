import { IsString, IsOptional } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  departmentName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
