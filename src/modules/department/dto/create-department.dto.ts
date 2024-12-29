import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  departmentName: string;

  @IsOptional()
  @IsString()
  description?: string;
}
