// good-deed.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';

export interface GoodDeedDto {
  id?: string;
  stt?: number;
  studentId?: string;
  studentCode?: string;
  studentName: string;
  date: Date;
  title: string;
  recognizedBy: string;
  teacherId?: string;
  classId?: string;
  className?: string;
  schoolId?: string;
  yearId?: number;
  note?: string;
  grade?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoodDeedService extends BaseService {

  /**
   * Lấy danh sách hoa việc tốt theo trường
   */
  getListBySchool(
    schoolId: string, 
    yearId: number, 
    grade?: number, 
    classId?: string
  ): Observable<any> {
    const params: any = { 
      schoolId: schoolId, 
      yearId: yearId 
    };
    
    if (grade) params.grade = grade;
    if (classId) params.classId = classId;
    
    return this.get('/GoodDeed/ListBySchool', params);
  }

  /**
   * Lấy danh sách hoa việc tốt theo lớp
   */
  getListByClass(classId: string, yearId: number): Observable<any> {
    return this.get('/GoodDeed/ListByClass', { 
      classId: classId, 
      yearId: yearId 
    });
  }

  /**
   * Lấy danh sách hoa việc tốt theo học sinh
   */
  getListByStudent(studentId: string, yearId: number): Observable<any> {
    return this.get('/GoodDeed/ListByStudent', { 
      studentId: studentId, 
      yearId: yearId 
    });
  }

  /**
   * Tạo mới hoa việc tốt
   */
  create(data: any): Observable<any> {
    return this.post('/GoodDeed/Create', data);
  }

  /**
   * Cập nhật hoa việc tốt
   */
  update(data: any): Observable<any> {
    return this.post('/GoodDeed/Update', data);
  }

  delete(id: string): Observable<any> {
      return super.delete(`/GoodDeed/Delete?id=${id}`, id);
  }

  /**
   * Đếm số lượng hoa việc tốt
   */
  getCount(schoolId: string, yearId: number, classId?: string): Observable<any> {
    const params: any = { 
      schoolId: schoolId, 
      yearId: yearId 
    };
    
    if (classId) params.classId = classId;
    
    return this.get('/GoodDeed/Count', params);
  }

  /**
   * Xuất Excel danh sách hoa việc tốt
   */
    exportExcel(
    schoolId: string, 
    yearId: number, 
    grade?: number, 
    classId?: string
    ): Observable<Blob> {
    const params: any = { 
        schoolId: schoolId, 
        yearId: yearId 
    };
    
    if (grade) params.grade = grade;
    if (classId) params.classId = classId;
    
    return this.get('/GoodDeed/ExportExcel', params, 'blob');
    }
}