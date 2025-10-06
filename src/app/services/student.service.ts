import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends BaseService {

  /**
   * Lấy thông tin học sinh theo Id
   * @param id Student Id
   */
  getStudentById(id: string): Observable<any> {
    return this.get('/Student', { Id: id });
  }

  /**
   * Lấy danh sách học sinh theo lớp
   * @param classId Class Id
   */
  getListByClass(classId: string): Observable<any[]> {
    return this.get('/Student/ListByClass', { ClassId: classId });
  }

  /**
   * Lấy danh sách học sinh theo lớp (version 2 - có thông tin đã học)
   * @param classId Class Id
   */
  getListByClass2(classId: string): Observable<any[]> {
    return this.get('/Student/ListByClass2', { ClassId: classId });
  }

  /**
   * Cập nhật trạng thái sử dụng LMS của học sinh
   * @param studentId Student Id
   * @param status Trạng thái
   */
  updateStatus(studentId: string, status: boolean): Observable<any> {
    return this.post('/Student/UpdateStatus', { studentId, status });
  }

  /**
   * Cập nhật trạng thái sử dụng MS của học sinh
   * @param studentId Student Id
   * @param status Trạng thái
   */
  updateMSStatus(studentId: string, status: boolean): Observable<any> {
    return this.post('/Student/UpdateMSStatus', { studentId, status });
  }

  /**
   * Lấy danh sách học sinh theo danh sách Id
   * @param classId Class Id
   * @param ids Danh sách Student Ids
   */
  getListByIds(classId: string, ids: string[]): Observable<any[]> {
    return this.post('/Student/ListByIds', { classId, ids });
  }
  
  getListRole(): Observable<any[]> {
    return this.get('/Student/ListRole');
    }
}