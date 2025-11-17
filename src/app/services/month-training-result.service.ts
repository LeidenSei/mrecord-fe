import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

export interface MonthlyTrainingResultDto {
  id?: string;
  studentId: string;
  bgdCode?: string;
  studentName?: string;
  classId: string;
  schoolId?: string;
  schoolYear: number;
  term: number;
  index?: number;
  month8?: string;
  month9?: string;
  month10?: string;
  month11?: string;
  month12?: string;
  month1?: string;
  month2?: string;
  month3?: string;
  month4?: string;
  month5?: string;
}

export interface BaseResponse {
  code: number;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MonthlyTrainingResultService extends BaseService {

  private apiUrl = '/MonthlyTrainingResult';

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  /**
   * Lấy danh sách kết quả rèn luyện theo lớp
   * @param classId ID lớp
   * @param schoolYear Năm học
   * @param term Học kỳ (1 hoặc 2)
   */
  getListByClass(classId: string, schoolYear: number, term: number): Observable<MonthlyTrainingResultDto[]> {
    const params = {
      ClassId: classId,
      SchoolYear: schoolYear.toString(),
      Term: term.toString()
    };
    return this.get(`${this.apiUrl}/ListByClass`, params);
  }

  /**
   * Cập nhật hàng loạt kết quả rèn luyện
   * @param results Danh sách kết quả cần cập nhật
   */
  bulkUpdate(results: MonthlyTrainingResultDto[]): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/BulkUpdate`, results);
  }
}