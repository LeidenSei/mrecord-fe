import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

@Injectable({
  providedIn: 'root'
})
export class HoSoGiaoDucService extends BaseService {

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  getListByToChuyenMon(
    toChuyenMonId: string, 
    schoolYear?: number, 
    loaiHoSo?: number, 
    trangThai?: number,
    capDo?: number
  ): Observable<any> {
    let params: any = { toChuyenMonId };
    if (schoolYear) {
      params.schoolYear = schoolYear;
    }
    if (loaiHoSo) {
      params.loaiHoSo = loaiHoSo;
    }
    if (trangThai !== undefined && trangThai !== null) {
      params.trangThai = trangThai;
    }
    if (capDo !== undefined && capDo !== null) {
      params.capDo = capDo;
    }
    return super.get('/HoSoGiaoDuc/ListByToChuyenMon', params);
  }

  getListBySchool(
    schoolId: string, 
    schoolYear?: number, 
    keyword?: string, 
    loaiHoSo?: number,
    capDo?: number
  ): Observable<any> {
    let params: any = { schoolId };
    if (schoolYear) {
      params.schoolYear = schoolYear;
    }
    if (keyword) {
      params.keyword = keyword;
    }
    if (loaiHoSo) {
      params.loaiHoSo = loaiHoSo;
    }
    if (capDo !== undefined && capDo !== null) {
      params.capDo = capDo;
    }
    return super.get('/HoSoGiaoDuc/ListBySchool', params);
  }

  getListNhaTruong(
    schoolId: string, 
    schoolYear?: number, 
    keyword?: string, 
    loaiHoSo?: number,
    capDo?: number
  ): Observable<any> {
    let params: any = { schoolId };
    if (schoolYear) {
      params.schoolYear = schoolYear;
    }
    if (keyword) {
      params.keyword = keyword;
    }
    if (loaiHoSo) {
      params.loaiHoSo = loaiHoSo;
    }
    if (capDo !== undefined && capDo !== null) {
      params.capDo = capDo;
    }
    return super.get('/HoSoGiaoDuc/ListNhaTruong', params);
  }

  getById(id: string): Observable<any> {
    return super.get('/HoSoGiaoDuc/GetById', { id });
  }

  create(data: any): Observable<any> {
    return super.post('/HoSoGiaoDuc/Create', data);
  }

  update(data: any): Observable<any> {
    return super.post('/HoSoGiaoDuc/Update', data);
  }

  deleteHoSo(id: string): Observable<any> {
    return super.delete(`/HoSoGiaoDuc/Delete?id=${id}`, null);
  }

  getStatisticByType(schoolId: string, schoolYear: number, capDo?: number): Observable<any> {
    let params: any = { schoolId, schoolYear };
    if (capDo !== undefined && capDo !== null) {
      params.capDo = capDo;
    }
    return super.get('/HoSoGiaoDuc/StatisticByType', params);
  }

  exportExcel(schoolId: string, schoolYear?: number, capDo?: number, toChuyenMonId?: string): Observable<any> {
    let params: any = { schoolId };
    if (schoolYear) {
      params.schoolYear = schoolYear;
    }
    if (capDo !== undefined && capDo !== null) {
      params.capDo = capDo;
    }
    if (toChuyenMonId) {
      params.toChuyenMonId = toChuyenMonId;
    }
    return super.get('/HoSoGiaoDuc/ExportExcel', params, 'blob');
  }
}