import { IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';

export enum QRCodeType {
  CHECKIN = 'checkin',
  CHECKOUT = 'checkout',
}

export class GenerateQRDto {
  @IsUUID()
  @IsString()
  departmentId: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  shiftId?: string;

  @IsEnum(QRCodeType)
  type: QRCodeType;
}
