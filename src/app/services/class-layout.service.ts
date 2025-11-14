import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';

// Interfaces
export interface SeatPosition {
  row: number;
  column: number;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  teamNumber?: number;
  isEmpty: boolean;
}

export interface ClassLayout {
  id?: string;
  schoolId: string;
  classId: string;
  className: string;
  schoolYear: number;
  term: number;
  totalRows: number;
  totalColumns: number;
  seats: SeatPosition[];
  teacherDeskPosition?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface AutoArrangeRequest {
  classId: string;
  totalRows: number;
  totalColumns: number;
  schoolYear: number;
  term: number;
}

export interface SwapSeatsRequest {
  layoutId: string;
  row1: number;
  col1: number;
  row2: number;
  col2: number;
}

export interface UpdateTeamNumberRequest {
  layoutId: string;
  row: number;
  col: number;
  teamNumber?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClassLayoutService extends BaseService {

  /**
   * Lấy sơ đồ lớp học theo ClassId, SchoolYear, Term
   * @param classId ID của lớp học
   * @param schoolYear Năm học
   * @param term Học kỳ (1 hoặc 2)
   */
  getByClass(classId: string, schoolYear: number, term: number): Observable<ClassLayout> {
    return this.get('/ClassLayout/GetByClass', {
      classId: classId,
      schoolYear: schoolYear,
      term: term
    });
  }

  /**
   * Lưu/Cập nhật sơ đồ lớp học
   * @param layout Thông tin sơ đồ lớp học
   */
  save(layout: ClassLayout): Observable<ClassLayout> {
    return this.post('/ClassLayout/Save', layout);
  }

  /**
   * Tự động sắp xếp học sinh vào sơ đồ
   * @param request Thông tin để tự động sắp xếp
   */
  autoArrange(request: AutoArrangeRequest): Observable<ClassLayout> {
    return this.post('/ClassLayout/AutoArrange', request);
  }

  /**
   * Đổi chỗ 2 học sinh
   * @param request Thông tin 2 vị trí cần đổi
   */
  swapSeats(request: SwapSeatsRequest): Observable<any> {
    return this.post('/ClassLayout/SwapSeats', request);
  }

  /**
   * Cập nhật số tổ cho học sinh
   * @param request Thông tin vị trí và số tổ
   */
  updateTeamNumber(request: UpdateTeamNumberRequest): Observable<any> {
    return this.post('/ClassLayout/UpdateTeamNumber', request);
  }

  /**
   * Xóa sơ đồ lớp học
   * @param id ID của sơ đồ lớp học
   */
  deleteLayout(id: string): Observable<any> {
    // Sử dụng phương thức delete của BaseService với query parameter
    return this.delete('/ClassLayout/Delete?id=' + id, null);
  }
}