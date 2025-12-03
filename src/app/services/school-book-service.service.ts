// File: school-book.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

// ==================== COMMON INTERFACES ====================

export interface TeacherInfo {
  truong: string;
  phuongXa: string;
  huyenQuan?: string; // Chỉ dùng cho ClassBook
  tinhTP: string;
  hoTenGV: string;
  monHoc?: string; // Chỉ dùng cho SubjectBook
  hocKy?: string; // Chỉ dùng cho SubjectBook
  namHoc: string;
}

export interface StudentInfo {
  stt: number;
  maHocSinh: string;
  hoTen: string;
  ngaySinh: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  code: string;
}

export interface TeacherSubject {
  id: string;
  name: string;
  code: string;
}

// ⭐ THÊM INTERFACE NÀY
export interface ClassDto {
  id: string;
  name: string;
  grade: number;
  studentCount: number;
  homeroomTeacherName: string;
}

// ==================== CLASSBOOK INTERFACES ====================

export interface ClassInfo {
  tenLop: string;
  siSo: number;
}

export interface SemesterInfo {
  hocKy: string;
  thang: number;
  nam: number;
}

export interface ParentInfo {
  hoTenCha: string;
  ngheNghiepCha: string;
  dienThoaiCha: string;
  hoTenMe: string;
  ngheNghiepMe: string;
  dienThoaiMe: string;
}

export interface StudentFullInfo extends StudentInfo {
  noiSinh: string;
  gioiTinh: string;
  danToc: string;
  doiTuongUuTien: string;
  diaChiGiaDinh: string;
  parentInfo?: ParentInfo;
}

export interface ClassBookExportData {
  teacherInfo: TeacherInfo;
  classInfo: ClassInfo;
  semesterInfo: SemesterInfo;
  students: StudentFullInfo[];
}

// ==================== SUBJECTBOOK INTERFACES ====================

export interface ClassData {
  classId: string;      // ⭐ THÊM classId để gọi API điểm
  tenLop: string;
  students: StudentInfo[];
}

export interface SubjectBookExportData {
  teacherInfo: TeacherInfo;
  classes: ClassData[];
}

// ==================== MARK INTERFACES ====================

export interface MarkRequest {
  classId: string;
  term: number;
  subjectId: string;
}

export interface MarkResponse {
  studentIndex: number;
  studentCode: string;
  studentName: string;
  studentDob: string;
  schoolCode: string;
  term: number;
  subjectCode: string;
  classId: string;
  score151?: any;
  score152?: any;
  score153?: any;
  score154?: any;
  score155?: any;
  score4510?: any;
  finalExamScore?: any;
  averageTerm1?: any;
  averageTerm2?: any;
  averageYear?: any;
  commentTerm1?: string;
  commentTerm2?: string;
  commentYear?: string;
  schoolYear: number;
}

// ==================== SERVICE ====================

@Injectable({
  providedIn: 'root'
})
export class SchoolBookService extends BaseService {

  constructor(
    httpClient: HttpClient,
    configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  // ==================== CLASSBOOK METHODS ====================

  /**
   * 📘 Lấy dữ liệu sổ gọi tên
   * @param classId - ID lớp học
   * @param schoolYear - Năm học (VD: 2024)
   * @param term - Học kỳ (1 hoặc 2)
   */
  getClassBookData(
    classId: string,
    schoolYear: number,
    term: number
  ): Observable<ClassBookExportData> {
    return this.get('/SchoolBook/class-book', {
      classId,
      schoolYear: schoolYear.toString(),
      term: term.toString()
    });
  }

  /**
   * Lấy danh sách lớp học của trường
   * - Admin/BGH: Xem tất cả lớp
   * - GVCN: Chỉ xem lớp mình chủ nhiệm
   */
  getClasses(): Observable<ClassDto[]> {
    return this.get('/SchoolBook/classes');
  }

  // ==================== SUBJECTBOOK METHODS ====================

  /**
   * Lấy danh sách giáo viên trong trường (chỉ Admin/Hiệu trưởng)
   */
  getTeachers(): Observable<Teacher[]> {
    return this.get('/SchoolBook/teachers');
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
    return this.get('/SchoolBook/subjects', params);
  }

  /**
   * 📊 Lấy thông tin để xuất sổ điểm
   * @param subjectId - ID môn học
   * @param schoolYear - Năm học (optional)
   * @param term - Học kỳ: 1 hoặc 2 (optional)
   * @param teacherId - ID giáo viên (optional - cho Admin chọn giáo viên khác)
   */
  getSubjectBookData(
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

    return this.get('/SchoolBook/subject-book', params);
  }

  /**
   * 📈 Lấy điểm số của học sinh trong lớp
   * @param classId - ID lớp học
   * @param term - Học kỳ (1 hoặc 2)
   * @param subjectId - ID môn học
   */
  getListMarkByClass(classId: string, term: number, subjectId: string): Observable<MarkResponse[]> {
    return this.post('/HighSchoolMark/GetListMarkByClass', {
      classId,
      term,
      subjectId
    });
  }
}