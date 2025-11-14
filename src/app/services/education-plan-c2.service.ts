import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

@Injectable({
  providedIn: 'root'
})
export class EducationPlanC2Service extends BaseService {
  private basePath = '/EducationPlanC2';

  constructor(
    httpClient: HttpClient,
    configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  /** Trả về DTO mặc định (InitDefault) */
  initDefault(classId: string, schoolYear?: number): Observable<any> {
    const url = `${this.basePath}/InitDefault`;
    const params: any = { classId };
    if (schoolYear !== undefined && schoolYear !== null) params.schoolYear = schoolYear;
    return this.get(url, params);
  }

  /** Tạo mới */
  create(dto: any): Observable<any> {
    const url = `${this.basePath}`;
    return this.post(url, dto);
  }

  /** Cập nhật (PUT) */
  update(dto: any): Observable<any> {
    const url = `${this.basePath}`;
    return this.put(url, dto);
  }

  /** Lấy chi tiết theo id */
  getById(id: string): Observable<any> {
    const url = `${this.basePath}`;
    return this.get(url, { id });
  }

  /** Xóa theo id */
  delete(id: string): Observable<any> {
    const url = `${this.basePath}`;
    return super.delete(url, id);
  }

  /**
   * Danh sách theo lớp (paginated)
   * GET /EducationPlanC2/ListByClass?classId=...&schoolYear=...&pageNumber=1&pageSize=20
   */
  listByClass(classId: string, schoolYear?: number, pageNumber: number = 1, pageSize: number = 20): Observable<any> {
    const url = `${this.basePath}/ListByClass`;
    const params: any = { classId, pageNumber, pageSize };
    if (schoolYear !== undefined && schoolYear !== null) params.schoolYear = schoolYear;
    return this.get(url, params);
  }

  /**
   * Danh sách theo trường (paginated)
   * GET /EducationPlanC2/ListBySchool?schoolId=...&schoolYear=...&creatorAccountId=...&pageNumber=1&pageSize=20
   */
  listBySchool(schoolId: string, schoolYear?: number, creatorAccountId?: string, pageNumber: number = 1, pageSize: number = 20): Observable<any> {
    const url = `${this.basePath}/ListBySchool`;
    const params: any = { schoolId, pageNumber, pageSize };
    if (schoolYear !== undefined && schoolYear !== null) params.schoolYear = schoolYear;
    if (creatorAccountId) params.creatorAccountId = creatorAccountId;
    return this.get(url, params);
  }
}
