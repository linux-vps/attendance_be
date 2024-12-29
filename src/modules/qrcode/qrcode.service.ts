import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import { GenerateQRDto, QRCodeType } from './dto/generate-qr.dto';

@Injectable()
export class QRCodeService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async generateAttendanceQR(generateQRDto: GenerateQRDto): Promise<string> {
    const { departmentId, shiftId, type } = generateQRDto;

    // Tạo JWT token với thời gian sống 15 phút
    const token = await this.jwtService.signAsync(
      {
        departmentId,
        shiftId,
        type,
        timestamp: new Date().toISOString(),
      },
      {
        expiresIn: '15m',
      },
    );

    // Tạo URL endpoint với token
    const endpoint = type === QRCodeType.CHECKIN ? '/timekeeping/checkin/qr' : '/timekeeping/checkout/qr';
    const qrData = `${process.env.SERVER_URL}${endpoint}?token=${token}`;

    // Tạo mã QR từ URL
    return await this.generateQRCode(qrData);
  }

  async verifyQRToken(token: string): Promise<any> {
    if (!token) {
      throw new UnauthorizedException('Token must be provided');
    }

    try {
      const decodedToken = await this.jwtService.verifyAsync(token);

      // Check if token has expired
      const tokenTimestamp = new Date(decodedToken.timestamp);
      const currentTime = new Date();
      const diffInMinutes =
        (currentTime.getTime() - tokenTimestamp.getTime()) / 1000 / 60;

      if (diffInMinutes > 15) {
        throw new UnauthorizedException(
          `QR code has expired after ${diffInMinutes} minutes`,
        );
      }

      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException({
        description: 'Invalid QR code',
        message: error.message,
      });
    }
  }
}
