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
}