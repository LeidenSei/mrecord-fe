import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

export interface ClassCooperationActivity {
  id?: string;
  classId: string;
  ma_LOP?: string;
  schoolId?: string;
  ma_TRUONG?: string;
  schoolYear: number;
  term: number;
  activityDate: Date | string | number;
  cooperationTarget: string;
  activityContent: string;
  note?: string;
  createdBy?: string;
  createdByName?: string;
  dateCreated?: Date | string;
  dateUpdated?: Date | string;
}

export interface BaseResponse {
  code: number;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClassCooperationActivityService extends BaseService {

  private apiUrl = '/ClassCooperationActivity';

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  /**
   * Lấy danh sách hoạt động phối hợp theo lớp
   * @param classId ID lớp
   * @param schoolYear Năm học
   * @param term Học kỳ (optional)
   */
  getListByClass(classId: string, schoolYear: number, term?: number): Observable<ClassCooperationActivity[]> {
    const params: any = {
      ClassId: classId,
      SchoolYear: schoolYear.toString()
    };
    
    if (term) {
      params.Term = term.toString();
    }
    
    return this.get(`${this.apiUrl}/ListByClass`, params);
  }

  /**
   * Tạo mới hoạt động phối hợp
   * @param activity Thông tin hoạt động
   */
  create(activity: ClassCooperationActivity): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/Create`, activity);
  }

  /**
   * Cập nhật hoạt động phối hợp
   * @param activity Thông tin hoạt động
   */
  update(activity: ClassCooperationActivity): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/Update`, activity);
  }

  /**
   * Xóa hoạt động phối hợp
   * @param id ID hoạt động
   */
  delete(id: string): Observable<BaseResponse> {
    return super.delete(`${this.apiUrl}/Delete`, id);
  }
}