export class DateUtils {
  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }

  static isHoliday(date: Date, holidays: Date[]): boolean {
    return holidays.some(
      (holiday) =>
        holiday.getFullYear() === date.getFullYear() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getDate() === date.getDate(),
    );
  }

  static getStartOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  static getEndOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  static getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  static getEndOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  static addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  static getDaysBetweenDates(startDate: Date, endDate: Date): number {
    const start = this.getStartOfDay(startDate);
    const end = this.getStartOfDay(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getWorkingDays(startDate: Date, endDate: Date, holidays: Date[] = []): number {
    let workingDays = 0;
    let currentDate = this.getStartOfDay(startDate);
    const lastDate = this.getStartOfDay(endDate);

    while (currentDate <= lastDate) {
      if (!this.isWeekend(currentDate) && !this.isHoliday(currentDate, holidays)) {
        workingDays++;
      }
      currentDate = this.addDays(currentDate, 1);
    }

    return workingDays;
  }
}
