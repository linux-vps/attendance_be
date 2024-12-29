import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseTimePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Time value is required');
    }

    // Check if time format is HH:mm
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      throw new BadRequestException(
        'Invalid time format. Please use HH:mm format (e.g., 09:30)',
      );
    }

    // Normalize time format to ensure HH:mm (with leading zeros)
    const [hours, minutes] = value.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
