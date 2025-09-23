import { Injectable } from '@angular/core';
import {AcademicWeek} from "../models/academic-week.model";

@Injectable({
  providedIn: 'root'
})
export class AcademicWeekService {
  private weeks: AcademicWeek[] = [];

  /**
   * Sinh danh sách tuần học
   * @param schoolYear - Ví dụ: 2025
   * @param startDate - Ngày bắt đầu năm học
   * @param endDate - Ngày kết thúc năm học
   */
  generateWeeks(schoolYear: number, startDate: Date, endDate: Date): AcademicWeek[] {
    this.weeks = [];
    let currentStart = new Date(startDate);
    let weekNo = 1;

    const schoolYearStr = `${schoolYear}-${schoolYear + 1}`;

    while (currentStart <= endDate) {
      // kết thúc tuần = Chủ nhật
      const currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + (7 - currentEnd.getDay()) % 7);

      if (currentEnd > endDate) {
        currentEnd.setTime(endDate.getTime());
      }

      this.weeks.push(new AcademicWeek(
        weekNo,
        new Date(currentStart),
        new Date(currentEnd),
        schoolYearStr
      ));

      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() + 1); // sang thứ 2 tuần sau
      weekNo++;
    }

    return this.weeks;
  }

  /**
   * Lấy tuần tương ứng với một ngày cụ thể
   * @param date - Ngày bất kỳ
   */
  getWeekByDate(date: Date): AcademicWeek | null {
    if (!this.weeks || this.weeks.length === 0) {
      console.warn('Chưa generate tuần, hãy gọi generateWeeks trước!');
      return null;
    }

    return this.weeks.find(w => w.isInRange(date)) || null;
  }

  /**
   * Lấy toàn bộ danh sách tuần đã generate
   */
  getAllWeeks(): AcademicWeek[] {
    return this.weeks;
  }
}
