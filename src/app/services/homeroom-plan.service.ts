import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';
export interface KeHoachGiaoDucItem {
  objectives: string;        // Mục tiêu
  content: string;           // Nội dung
  solutions: string;         // Giải pháp
  expectedResults: string;   // Kết quả mong đợi
}

export interface KeHoachChuNhiem {
  id?: string;
  schoolId?: string;
  classId: string;
  className?: string;
  grade?: number;
  homeRoomTeacherId?: string;
  homeRoomTeacherName?: string;
  schoolYear: number;
  semester: number;  // 1 hoặc 2
  planDate: Date;
  dateCreated?: Date;
  dateModified?: Date;
  
  // A. TÌNH HÌNH CHUNG (chỉ có ở HK1)
  advantages?: string;
  difficulties?: string;
  
  // B. KẾ HOẠCH GIÁO DỤC
  traditionEducation: KeHoachGiaoDucItem;
  academicEducation: KeHoachGiaoDucItem;
  extracurricularEducation: KeHoachGiaoDucItem;
  
  status?: string;  // draft, submitted
  notes?: string;
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class KeHoachChuNhiemService extends BaseService {

  // Lấy kế hoạch theo lớp và học kỳ
  getByClassSemester(classId: string, semester: number, schoolYear: number): Observable<KeHoachChuNhiem> {
    return this.get('/KeHoachChuNhiem/GetByClassSemester', { 
      classId, 
      semester: semester.toString(),
      schoolYear: schoolYear.toString()
    });
  }

  getById(id: string): Observable<KeHoachChuNhiem> {
    return this.get('/KeHoachChuNhiem', { id });
  }

  // Lấy danh sách theo trường với filter
  getListBySchool(
    schoolId: string,
    schoolYear: number,
    pageNumber: number = 1,
    pageSize: number = 20,
    className?: string,
    semester?: number,
    grade?: number,
    status?: string
  ): Observable<PaginatedResult<KeHoachChuNhiem>> {
    const params: any = {
      schoolId,
      schoolYear: schoolYear.toString(),
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    };

    if (className) params.className = className;
    if (semester) params.semester = semester.toString();
    if (grade) params.grade = grade.toString();
    if (status) params.status = status;

    return this.get('/KeHoachChuNhiem/ListBySchool', params);
  }

  create(data: KeHoachChuNhiem): Observable<KeHoachChuNhiem> {
    return this.post('/KeHoachChuNhiem', data);
  }

  update(data: KeHoachChuNhiem): Observable<KeHoachChuNhiem> {
    return this.put('/KeHoachChuNhiem', data);
  }

  delete(id: string, p0: { id: string; }): Observable<any> {
    return this.delete('/KeHoachChuNhiem', { id });
  }

  save(data: KeHoachChuNhiem): Observable<KeHoachChuNhiem> {
    const isValidId = data.id && 
                      data.id.length === 24 && 
                      data.id !== '000000000000000000000000' &&
                      /^[a-fA-F0-9]{24}$/.test(data.id);
    
    if (isValidId) {
      return this.update(data);
    } else {
      const newData = { ...data };
      delete newData.id;
      return this.create(newData);
    }
  }
}