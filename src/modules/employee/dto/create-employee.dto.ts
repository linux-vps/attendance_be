import { IsNotEmpty, IsString, IsEmail, IsDate, IsOptional, IsUUID, IsEnum, ValidateIf, IsDateString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '../../../common/enums/role.enum';

export class CreateEmployeeDto {

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/,
    { message: 'Password phải có ít nhất 6 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt' },
  )
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(
    /^\+?\d{10,15}$/,
    { message: 'Số điện thoại không hợp lệ, phải bao gồm mã quốc gia và từ 10 đến 15 chữ số' },
  )
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsOptional()
  @IsDateString({}, { message: 'birthDate phải là chuỗi ngày tháng hợp lệ theo ISO 8601' })
  birthDate?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'departmentId là bắt buộc đối' })
  @IsUUID('4', { message: 'departmentId phải là UUID hợp lệ' })
  departmentId?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'role phải là một trong các giá trị ADMIN, USER, MANAGER' })
  role?: Role;
}