
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

export interface ParentCommitteeDto {
  id?: string;
  stt?: number;
  position: string;
  positionText?: string;
  parentId: string;
  parentName?: string;
  phoneNumber?: string;
  email?: string;
  workplace?: string;
  address?: string;
  studentId: string;
  studentName?: string;
  className?: string;
  grade?: number;
  relationship: string;
  relationshipText?: string;
  isActive?: boolean;
  note?: string;
  createdDate?: Date;
}

export interface ParentCommitteeRequest {
  parentId: string;
  studentId: string;
  classId: string;
  schoolYearId: string;
  position: string;
  relationship: string;
  note?: string;
}

export interface ParentCommitteeUpdateRequest {
  id: string;
  position: string;
  relationship: string;
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParentCommitteeService extends BaseService {

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  /**
   * Lấy danh sách ban đại diện theo lớp
   */
  getListByClass(classId: string, schoolYearId: string, position: string = ''): Observable<ParentCommitteeDto[]> {
    const params: any = {
      ClassId: classId,
      SchoolYearId: schoolYearId
    };
    
    if (position) {
      params.Position = position;
    }

    return this.get('/ParentCommittee/ListByClass', params);
  }

  /**
   * Lấy danh sách ban đại diện theo khối
   */
  getListByGrade(grade: number, schoolYearId: string, position: string = ''): Observable<ParentCommitteeDto[]> {
    const params: any = {
      Grade: grade,
      SchoolYearId: schoolYearId
    };
    
    if (position) {
      params.Position = position;
    }

    return this.get('/ParentCommittee/ListByGrade', params);
  }

  /**
   * Lấy chi tiết thành viên ban
   */
  getById(id: string): Observable<ParentCommitteeDto> {
    return this.get('/ParentCommittee', { Id: id });
  }

  /**
   * Thêm mới thành viên ban đại diện
   */
  create(request: ParentCommitteeRequest): Observable<any> {
    return this.post('/ParentCommittee/Create', request);
  }

  /**
   * Cập nhật thông tin thành viên ban
   */
  update(request: ParentCommitteeUpdateRequest): Observable<any> {
    return this.post('/ParentCommittee/Update', request);
  }

  /**
   * Xóa thành viên khỏi ban
   */
  delete(id: string): Observable<any> {
    return this.post('/ParentCommittee/Delete', { id });
  }

  /**
   * Lấy lịch sử tham gia ban của phụ huynh
   */
  getListByParent(parentId: string): Observable<ParentCommitteeDto[]> {
    return this.get('/ParentCommittee/ListByParent', { ParentId: parentId });
  }
}