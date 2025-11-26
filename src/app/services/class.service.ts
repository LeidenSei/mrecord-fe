import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';

@Injectable({
  providedIn: 'root'
})
export class ClassService extends BaseService {

  /**
   * Lấy thông tin lớp học theo Id
   * @param id Class Id
   */
  getClassById(id: string): Observable<any> {
    return this.get('/Class', { Id: id });
  }

  /**
   * Lấy danh sách lớp học theo trường
   * @param schoolId School Id
   */
  getListBySchool(schoolId: string): Observable<any> {
    return this.get('/Class/ListBySchool', { SchoolId: schoolId });
  }

  /**
   * Lấy danh sách lớp học theo Tổ trưởng chuyên môn (TTCM)
   * Chỉ dành cho Teacher, Staff, SchoolAdmin
   */
  getListByTTCM(): Observable<any> {
    return this.get('/Class/ListByTTCM');
  }

  /**
   * Lấy danh sách lớp học theo giáo viên
   * @param schoolId School Id
   * @param teacherId Teacher Id
   */
  getListByTeacher(schoolId: string, teacherId: string): Observable<any> {
    return this.get('/Class/ListByTeacher', { 
      SchoolId: schoolId, 
      TeacherId: teacherId 
    });
  }

  /**
   * Lưu vai trò học sinh trong lớp
   * @param classId Class Id
   * @param studentId Student Id
   * @param studentName Tên học sinh
   * @param roleIds Danh sách Role Ids
   * @param roleNames Danh sách tên vai trò
   */
  saveStudentRole(
    classId: string, 
    studentId: string, 
    studentName: string, 
    roleIds: string[], 
    roleNames: string[]
  ): Observable<any> {
    return this.post('/Class/SaveStudentRole', { 
      ClassId: classId,
      StudentId: studentId,
      StudentName: studentName,
      RoleIds: roleIds,
      RoleNames: roleNames
    });
  }

  /**
   * Lưu vai trò học sinh hàng loạt
   * @param classId Class Id
   * @param students Danh sách học sinh với vai trò
   */
  saveStudentRoleBulk(classId: string, students: Array<{
    studentId: string;
    studentName: string;
    roleIds: string[];
    roleNames: string[];
  }>): Observable<any> {
    return this.post('/Class/SaveStudentRoleBulk', {
      ClassId: classId,
      Students: students
    });
  }

  /**
   * Lấy danh sách giáo viên - bộ môn theo lớp
   * @param classId Class Id
   * @param semester Học kỳ (optional)
   */
  getTeacherSubjectList(classId: string, semester?: number): Observable<any> {
    const params: any = { ClassId: classId };
    if (semester !== undefined) {
      params.Semester = semester;
    }
    return this.get('/Class/TeacherSubjectList', params);
  }

  /**
   * Lấy danh sách giáo viên - bộ môn theo trường
   * @param schoolId School Id
   * @param classId Class Id (optional - lọc theo lớp cụ thể)
   * @param semester Học kỳ (optional)
   */
  getTeacherSubjectListBySchool(
    schoolId: string, 
    classId?: string, 
    semester?: number
  ): Observable<any> {
    const params: any = { SchoolId: schoolId };
    if (classId) {
      params.ClassId = classId;
    }
    if (semester !== undefined) {
      params.Semester = semester;
    }
    return this.get('/Class/TeacherSubjectListBySchool', params);
  }

  /**
   * Cập nhật trạng thái ký của giáo viên bộ môn
   * @param classId Class Id
   * @param teacherId Teacher Id
   * @param subjectId Subject Id
   * @param signed Đã ký hay chưa
   * @param replaceByPrincipal Thay thế bởi hiệu trưởng
   */
  updateTeacherSubjectSigned(
    classId: string,
    teacherId: string,
    subjectId: string,
    signed: boolean,
    replaceByPrincipal: boolean = false
  ): Observable<any> {
    return this.post('/Class/UpdateTeacherSubjectSigned', {
      ClassId: classId,
      TeacherId: teacherId,
      SubjectId: subjectId,
      Signed: signed,
      ReplaceByPrincipal: replaceByPrincipal
    });
  }

  /**
   * Cập nhật số tiết của giáo viên bộ môn
   * @param classId Class Id
   * @param teacherId Teacher Id
   * @param subjectId Subject Id
   * @param periodCount Số tiết
   */
  updateTeacherSubjectPeriodCount(
    classId: string,
    teacherId: string,
    subjectId: string,
    periodCount: number
  ): Observable<any> {
    return this.post('/Class/UpdateTeacherSubjectPeriodCount', {
      ClassId: classId,
      TeacherId: teacherId,
      SubjectId: subjectId,
      PeriodCount: periodCount
    });
  }

  /**
   * Lấy quy định và tiêu chuẩn của lớp
   * @param classId Class Id
   */
  getClassRulesAndCriteria(classId: string): Observable<any> {
    return this.get('/Class/GetClassRulesAndCriteria', { ClassId: classId });
  }

  /**
   * Lưu quy định và tiêu chuẩn của lớp
   * @param classId Class Id
   * @param rules Quy định về phong cách học sinh
   * @param criteria Các tiêu chuẩn đánh giá (1-7)
   */
  saveClassRulesAndCriteria(
    classId: string,
    rules: string,
    criteria1: string,
    criteria2: string,
    criteria3: string,
    criteria4: string,
    criteria5: string,
    criteria6: string,
    criteria7: string
  ): Observable<any> {
    return this.post('/Class/SaveClassRulesAndCriteria', {
      ClassId: classId,
      StudentBehaviorRules: rules,
      ClassExcellenceCriteria1: criteria1,
      ClassExcellenceCriteria2: criteria2,
      ClassExcellenceCriteria3: criteria3,
      ClassExcellenceCriteria4: criteria4,
      ClassExcellenceCriteria5: criteria5,
      ClassExcellenceCriteria6: criteria6,
      ClassExcellenceCriteria7: criteria7
    });
  }
}