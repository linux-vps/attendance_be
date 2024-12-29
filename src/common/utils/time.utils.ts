import { TIME_CONSTANTS } from '../constants/time.constants';

export class TimeUtils {
  static parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  static isLate(checkInTime: string, shiftStartTime: string): boolean {
    const checkIn = this.parseTime(checkInTime);
    const shiftStart = this.parseTime(shiftStartTime);

    const checkInMinutes = checkIn.hours * 60 + checkIn.minutes;
    const shiftStartMinutes = shiftStart.hours * 60 + shiftStart.minutes;

    return checkInMinutes - shiftStartMinutes > TIME_CONSTANTS.LATE_THRESHOLD_MINUTES;
  }

  static isEarlyLeave(checkOutTime: string, shiftEndTime: string): boolean {
    const checkOut = this.parseTime(checkOutTime);
    const shiftEnd = this.parseTime(shiftEndTime);

    const checkOutMinutes = checkOut.hours * 60 + checkOut.minutes;
    const shiftEndMinutes = shiftEnd.hours * 60 + shiftEnd.minutes;

    return shiftEndMinutes - checkOutMinutes > TIME_CONSTANTS.EARLY_LEAVE_THRESHOLD_MINUTES;
  }

  static formatTimeToString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  static isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return TIME_CONSTANTS.WORKING_DAYS.includes(dayOfWeek);
  }
}
