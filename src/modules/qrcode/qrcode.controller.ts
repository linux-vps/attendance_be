import { Controller, Get, Post, Param, Query, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { QRCodeService } from './qrcode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('qrcode')
@UseGuards(JwtAuthGuard)
export class QRCodeController {
  constructor(private readonly qrCodeService: QRCodeService) {}

  @Post('generate')
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER)
  async generateAttendanceQR(
    @Body() generateQRDto: GenerateQRDto,
    @CurrentUser() user: any,
  ) {
    // Kiểm tra xem manager có quyền tạo QR cho phòng ban này không
    if (user.departmentId !== generateQRDto.departmentId) {
      throw new UnauthorizedException('You can only generate QR codes for your department');
    }

    return this.qrCodeService.generateAttendanceQR(generateQRDto);
  }
}
