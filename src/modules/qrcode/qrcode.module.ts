import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { QRCodeService } from './qrcode.service';
import { QRCodeController } from './qrcode.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SharedModule,
    ConfigModule,
  ],
  controllers: [QRCodeController],
  providers: [QRCodeService],
  exports: [QRCodeService],
})
export class QRCodeModule {}
