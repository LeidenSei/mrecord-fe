import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

@Injectable({
  providedIn: 'root'
})
export class StudentTrackingService extends BaseService {

  private apiUrl = 'StudentTracking';

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  getById(id: string): Observable<any> {
    return this.get(`${this.apiUrl}?Id=${id}`);
  }

  getListByStudent(studentId: string, schoolYear: number): Observable<any> {
    const params = {
      StudentId: studentId,
      SchoolYear: schoolYear.toString()
    };
    return this.get(`${this.apiUrl}/ListByStudent`, params);
  }

  getListByClass(classId: string, schoolYear: number, period?: string): Observable<any> {
    let params: any = {
      ClassId: classId,
      SchoolYear: schoolYear.toString()
    };
    if (period) {
      params.Period = period;
    }
    return this.get(`${this.apiUrl}/ListByClass`, params);
  }

  getListBySchool(schoolYear: number, grade?: number, period?: string): Observable<any> {
    let params: any = {
      SchoolYear: schoolYear.toString()
    };
    if (grade) {
      params.Grade = grade.toString();
    }
    if (period) {
      params.Period = period;
    }
    return this.get(`${this.apiUrl}/ListBySchool`, params);
  }

  countByStudent(studentId: string, schoolYear: number): Observable<any> {
    const params = {
      StudentId: studentId,
      SchoolYear: schoolYear.toString()
    };
    return this.get(`${this.apiUrl}/CountByStudent`, params);
  }

  countByClass(classId: string, schoolYear: number, period?: string): Observable<any> {
    let params: any = {
      ClassId: classId,
      SchoolYear: schoolYear.toString()
    };
    if (period) {
      params.Period = period;
    }
    return this.get(`${this.apiUrl}/CountByClass`, params);
  }

  create(data: any): Observable<any> {
    return this.post(`${this.apiUrl}/Create`, data);
  }

  update(data: any): Observable<any> {
    return this.post(`${this.apiUrl}/Update`, data);
  }

  delete(id: string): Observable<any> {
    return this.post(`${this.apiUrl}/Delete`, { id: id });
  }

  deleteMultiple(ids: string[]): Observable<any> {
    return this.post(`${this.apiUrl}/DeleteMultiple`, ids);
  }

  bulkCreate(data: any[]): Observable<any> {
    return this.post(`${this.apiUrl}/BulkCreate`, data);
  }
}