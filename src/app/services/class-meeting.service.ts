// services/class-meeting.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';

// Enums
export enum LoaiHoatDongLop {
  SinhHoatLop = 1,
  ChuyenDe = 2,
  HopChuNhiem = 3,
  BienBanHop = 4
}

export enum LoaiNguoiThamDu {
  GiaoVien = 1,
  HocSinh = 2,
  PhuHuynh = 3,
  Khac = 99
}

// Interfaces
export interface NguoiThamDu {
  accountId: string;
  hoTen: string;
  loaiNguoi: LoaiNguoiThamDu;
  coMat: boolean;
  lyDoVang?: string;
}

export interface YKien {
  nguoiPhatBieu: string;
  noiDung: string;
}

export interface VanDeThaoLuan {
  stt: number;
  tieuDe: string;
  noiDung: string;
  nguoiTrinh: string;
  danhSachYKien?: YKien[];
}

export interface NhiemVu {
  noiDung: string;
  nguoiThucHienId: string;
  tenNguoiThucHien: string;
  hanHoanThanh?: Date;
  daHoanThanh: boolean;
}

export interface ClassMeeting {
  id?: string;
  classId: string;
  schoolId: string;
  schoolYear: number;
  loaiHoatDong: LoaiHoatDongLop;
  term?: number;
  week?: number;
  lanHop?: number;
  tieuDe: string;
  thoiGianHop?: Date | string | number;
  diaDiem?: string;
  chuToaId?: string;
  tenChuToa?: string;
  thuKyId?: string;
  tenThuKy?: string;
  danhSachThamDu?: NguoiThamDu[];
  noiDung: string;
  cacVanDe?: VanDeThaoLuan[];
  ketLuan?: string;
  danhSachNhiemVu?: NhiemVu[];
  fileDinhKem?: string[];
  createdBy?: string;
  createdDate?: Date;
  updatedDate?: Date;
}

export interface BaseResponse {
  code: number;
  message: string;
  description: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClassMeetingService extends BaseService {

  private readonly apiUrl = 'ClassMeeting';

  constructor(
    public override httpClient: HttpClient,
    protected override configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  // Get single meeting
  getById(id: string): Observable<ClassMeeting> {
    return this.get(`${this.apiUrl}?Id=${id}`);
  }

  // Get list by class
  getListByClass(
    classId: string,
    schoolYear?: number,
    loaiHoatDong?: LoaiHoatDongLop
  ): Observable<ClassMeeting[]> {
    let params: any = { ClassId: classId };
    if (schoolYear) params.SchoolYear = schoolYear;
    if (loaiHoatDong !== undefined) params.LoaiHoatDong = loaiHoatDong;
    
    return this.get(`${this.apiUrl}/ListByClass`, params);
  }

  // Get list by school
  getListBySchool(
    schoolId: string,
    schoolYear?: number,
    grade?: number,
    loaiHoatDong?: LoaiHoatDongLop
  ): Observable<ClassMeeting[]> {
    let params: any = { SchoolId: schoolId };
    if (schoolYear) params.SchoolYear = schoolYear;
    if (grade) params.Grade = grade;
    if (loaiHoatDong !== undefined) params.LoaiHoatDong = loaiHoatDong;
    
    return this.get(`${this.apiUrl}/ListBySchool`, params);
  }

  // Get Sinh hoat lop
  getSinhHoatLop(
    classId: string,
    schoolYear: number,
    term?: number
  ): Observable<ClassMeeting[]> {
    let params: any = { ClassId: classId, SchoolYear: schoolYear };
    if (term) params.Term = term;
    
    return this.get(`${this.apiUrl}/SinhHoatLop`, params);
  }

  // Get Chuyen de
  getChuyenDe(
    classId: string,
    schoolYear: number,
    term?: number
  ): Observable<ClassMeeting[]> {
    let params: any = { ClassId: classId, SchoolYear: schoolYear };
    if (term) params.Term = term;
    
    return this.get(`${this.apiUrl}/ChuyenDe`, params);
  }

  // Get Hop chu nhiem
  getHopChuNhiem(
    classId: string,
    schoolYear: number
  ): Observable<ClassMeeting[]> {
    const params = { ClassId: classId, SchoolYear: schoolYear };
    return this.get(`${this.apiUrl}/HopChuNhiem`, params);
  }

  // Get Bien ban hop
  getBienBanHop(
    classId: string,
    schoolYear: number
  ): Observable<ClassMeeting[]> {
    const params = { ClassId: classId, SchoolYear: schoolYear };
    return this.get(`${this.apiUrl}/BienBanHop`, params);
  }

  // Create
  create(meeting: ClassMeeting): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/Create`, meeting);
  }

  // Update
  update(meeting: ClassMeeting): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/Update`, meeting);
  }

  // Delete
  delete(id: string): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/Delete?Id=${id}`, {});
  }

  // Update attendees
  updateAttendees(id: string, attendees: NguoiThamDu[]): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/UpdateAttendees?Id=${id}`, attendees);
  }

  // Add task
  addTask(id: string, task: NhiemVu): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/AddTask?Id=${id}`, task);
  }

  // Update task status
  updateTaskStatus(
    id: string,
    taskIndex: number,
    isCompleted: boolean
  ): Observable<BaseResponse> {
    return this.post(
      `${this.apiUrl}/UpdateTaskStatus?Id=${id}&TaskIndex=${taskIndex}&IsCompleted=${isCompleted}`,
      {}
    );
  }
}