import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';

// Interface cho School Config
export interface SchoolConfig {
  id: string;
  signUrl?: string;
  ngayKyHocBa?: string;
  ngayPhatHanhHocBa?: string;
  masterCCCD?: string;
  masterPosition?: string;
  masterName?: string;
  dauPhatHanhUrl?: string;
  signForName?: string;
  signForCCCD?: string;
  signForPosition?: string;
  signForSignUrl?: string;
  lmsHideMenuSchoolCourse?: boolean;
  hbsPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolService extends BaseService {

  /**
   * Lấy thông tin trường học theo Id
   * @param id School Id
   */
  getSchoolById(id: string): Observable<any> {
    return this.get('/School', { Id: id });
  }

  /**
   * Lấy danh sách khối học của trường
   * @param id School Id
   * @returns Danh sách các khối (6, 7, 8, 9...)
   */
    getListGradeOfSchool(id: string): Observable<number[]> {
    return this.get('/School/ListGradeOfSchool', { Id: id });
    }
  /**
   * Lưu cấu hình trường học
   * Chỉ dành cho SchoolAdmin, SchoolManager
   * @param config Thông tin cấu hình trường
   */
  saveSchoolConfig(config: SchoolConfig): Observable<any> {
    return this.post('/School/SaveSchoolConfig', config);
  }
}