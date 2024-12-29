import { IsString, IsEmail, IsBoolean, MinLength, IsOptional, IsPhoneNumber, IsDateString, IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/,
    { message: 'Password phải bao gồm chữ hoa, số và ký tự đặc biệt' },
  )
  password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(
    /^\+?\d{10,15}$/,
    { message: 'Số điện thoại không hợp lệ, phải bao gồm mã quốc gia và từ 10 đến 15 chữ số' },
  )
  phoneNumber: string;

  @IsOptional()
  @IsDateString({}, { message: 'birthDate phải là chuỗi ngày tháng hợp lệ theo ISO 8601' })
  birthDate?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'role phải là một trong các giá trị ADMIN, USER, MANAGER' })
  role?: Role;

  @IsOptional()
  @IsString()
  avatar?: string;
}
