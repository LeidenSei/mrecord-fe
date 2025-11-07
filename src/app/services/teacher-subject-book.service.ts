import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

// ==================== INTERFACES ====================

export interface TeacherInfo {
  truong: string;
  phuongXa: string;
  tinhTP: string;
  hoTenGV: string;
  monHoc: string;
  hocKy: string;
  namHoc: string;
}

export interface StudentInfo {
  stt: number;
  maHocSinh: string;
  hoTen: string;
  ngaySinh: string;
}

export interface ClassData {
  tenLop: string;
  students: StudentInfo[];
}

export interface SubjectBookExportData {
  teacherInfo: TeacherInfo;
  classes: ClassData[];
}

export interface TeacherSubject {
  id: string;
  name: string;
  code: string;
}
export interface Teacher {
  id: string;
  fullName: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherSubjectBookService extends BaseService {

  constructor(
    httpClient: HttpClient,
    configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  getTeachers(): Observable<Teacher[]> {
    return this.get('/TeacherSubjectBook/ListTeachers');
  }

  /**
   * Lấy danh sách môn học mà giáo viên đang giảng dạy
   * @param teacherId - ID giáo viên (optional - cho Admin chọn giáo viên khác)
   */
  getTeacherSubjects(teacherId?: string): Observable<TeacherSubject[]> {
    const params: any = {};
    if (teacherId) {
      params.teacherId = teacherId;
    }
    return this.get('/TeacherSubjectBook/ListSubjects', params);
  }

  /**
   * Lấy thông tin để xuất sổ điểm
   * @param subjectId - ID môn học
   * @param schoolYear - Năm học (optional)
   * @param term - Học kỳ: 1 hoặc 2 (optional)
   * @param teacherId - ID giáo viên (optional - cho Admin chọn giáo viên khác)
   */
  getExportInfo(
    subjectId: string,
    schoolYear?: number,
    term?: number,
    teacherId?: string
  ): Observable<SubjectBookExportData> {
    const params: any = { subjectId };
    
    if (schoolYear) {
      params.schoolYear = schoolYear.toString();
    }
    
    if (term) {
      params.term = term.toString();
    }

    if (teacherId) {
      params.teacherId = teacherId;
    }

    return this.get('/TeacherSubjectBook/ExportInfo', params);
  }
}