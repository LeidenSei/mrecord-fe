import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';

export interface KeHoachItem {
  stt?: number;
  timeFrom: Date | string;
  timeTo: Date | string;
  content: string;
  evaluation: string;
}

export interface NhatKyItem {
  stt?: number;
  date: Date;
  content: string;
}

export interface ThongKeThangItem {
  sTT: number;
  noiDung: string;
  tuan1: number;
  tuan2: number;
  tuan3: number;
  tuan4: number;
}

export interface KeHoachThang {
  id?: string;
  schoolId?: string;
  classId: string;
  className?: string;
  grade?: number;
  accountId?: string;
  accountName?: string;
  month: number;
  year: number;
  schoolYear?: number;
  // Cấp 1 fields
  chuDeThang?: string;
  trongTam?: string;
  keHoachs?: KeHoachItem[];
  nhatKys?: NhatKyItem[];
  // Cấp 2 fields
  keHoachHoatDong?: string;
  danhGiaHocTap?: string;
  danhGiaRenLuyen?: string;
  thongKeThang?: ThongKeThangItem[];
  // Common fields
  dateCreated?: Date;
  dateModified?: Date;
  trangThai?: number;
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
export class MonthlyPlanService extends BaseService {

  // ===== CẤP 1 METHODS =====

  getByClassMonthYear(classId: string, month: number, year: number): Observable<KeHoachThang> {
    return this.get('/KeHoachThang/GetByClassMonthYear', { 
      classId, 
      month: month.toString(), 
      year: year.toString() 
    });
  }

  getById(id: string): Observable<KeHoachThang> {
    return this.get('/KeHoachThang', { id });
  }

  getByClassYear(classId: string, year: number): Observable<KeHoachThang[]> {
    return this.get('/KeHoachThang/GetByClassYear', { 
      classId, 
      year: year.toString() 
    });
  }

  getListBySchool(
    schoolId: string,
    schoolYear: number,
    pageNumber: number = 1,
    pageSize: number = 20,
    className?: string,
    month?: number,
    grade?: number
  ): Observable<PaginatedResult<KeHoachThang>> {
    const params: any = {
      schoolId,
      schoolYear: schoolYear.toString(),
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    };

    if (className) params.className = className;
    if (month) params.month = month.toString();
    if (grade) params.grade = grade.toString();

    return this.get('/KeHoachThang/ListBySchool', params);
  }

  create(data: KeHoachThang): Observable<KeHoachThang> {
    return this.post('/KeHoachThang', data);
  }

  update(data: KeHoachThang): Observable<KeHoachThang> {
    return this.put('/KeHoachThang', data);
  }

  deleteKeHoach(id: string): Observable<any> {
    return this.delete('/KeHoachThang', { id });
  }

  save(data: KeHoachThang): Observable<KeHoachThang> {
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

  // ===== CẤP 2 METHODS =====

  getByClassMonthYearC2(classId: string, month: number, year: number): Observable<KeHoachThang> {
    return this.get('/KeHoachThang/GetByClassMonthYearC2', {
      classId,
      month: month.toString(),
      year: year.toString()
    });
  }

  saveC2(data: KeHoachThang): Observable<KeHoachThang> {
    // Sử dụng endpoint chung C2/Save cho cả create và update
    return this.post('/KeHoachThang/C2/Save', data);
  }

  getByClassYearC2(classId: string, year: number): Observable<KeHoachThang[]> {
    return this.get('/KeHoachThang/GetByClassYearC2', {
      classId,
      year: year.toString()
    });
  }
}