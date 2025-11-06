import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

@Injectable({
  providedIn: 'root'
})
export class ToChuyenMonService extends BaseService {

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  /**
   * Lấy danh sách tổ chuyên môn theo trường
   */
  getListBySchool(schoolId: string, schoolYear?: number, keyword?: string): Observable<any> {
    let params: any = { schoolId };
    if (schoolYear) {
      params.schoolYear = schoolYear;
    }
    if (keyword) {
      params.keyword = keyword;
    }
    return super.get('/ToChuyenMon/ListBySchool', params);
  }

  /**
   * Lấy chi tiết tổ chuyên môn
   */
  getById(id: string): Observable<any> {
    return super.get('/ToChuyenMon/GetById', { id });
  }

  /**
   * Tạo mới tổ chuyên môn
   */
  create(data: any): Observable<any> {
    return super.post('/ToChuyenMon/Create', data);
  }

  /**
   * Cập nhật tổ chuyên môn
   */
  update(data: any): Observable<any> {
    return super.post('/ToChuyenMon/Update', data);
  }

  /**
   * Cập nhật danh sách thành viên
   */
  updateMembers(id: string, thanhVienIds: string[]): Observable<any> {
    return super.post('/ToChuyenMon/UpdateMembers', { id, thanhVienIds });
  }

  /**
   * Cập nhật danh sách môn học
   */
  updateSubjects(id: string, subjectIds: string[]): Observable<any> {
    return super.post('/ToChuyenMon/UpdateSubjects', { id, subjectIds });
  }

  /**
   * Xóa tổ chuyên môn
   */
  deleteToChuyenMon(id: string): Observable<any> {
    return super.delete(`/ToChuyenMon/Delete?id=${id}`, null);
  }

  /**
   * Xuất Excel
   */
  exportExcel(schoolId: string, schoolYear?: number): Observable<any> {
    let params: any = { schoolId };
    if (schoolYear) {
      params.schoolYear = schoolYear;
    }
    return super.get('/ToChuyenMon/ExportExcel', params, 'blob');
  }
}