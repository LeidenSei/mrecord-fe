import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';

export interface KeHoachItem {
  stt?: number;
  timeFrom: Date | string;  // Support cả Date và string để linh hoạt
  timeTo: Date | string;
  content: string;
  evaluation: string;
}

export interface NhatKyItem {
  stt?: number;
  date: Date;
  content: string;
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
  chuDeThang: string;
  trongTam: string;
  keHoachs: KeHoachItem[];
  nhatKys: NhatKyItem[];
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

  // Lấy kế hoạch theo lớp, tháng, năm
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

  // Lấy tất cả kế hoạch của 1 lớp trong năm
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

  // Smart save: tự động detect create/update
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
}