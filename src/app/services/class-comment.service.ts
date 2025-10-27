import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';
@Injectable({
  providedIn: 'root'
})
export class ClassCommentService extends BaseService {

  private apiUrl = '/ClassComment';

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  getById(id: string): Observable<any> {
    return this.get(`${this.apiUrl}?Id=${id}`);
  }
  deleteByDateCreated(classId: string, dateCreated: string): Observable<any> {
    return this.post(`${this.apiUrl}/DeleteByDateCreated`, { 
      classId: classId,
      dateCreated: dateCreated 
    });
  }

  getListByClass(
    classId: string, 
    schoolYear: number, 
    type?: string, 
    priority?: string,
    semester?: number 
  ): Observable<any> {
    let params: any = {
      ClassId: classId,
      SchoolYear: schoolYear.toString()
    };
    
    if (type) {
      params.Type = type;
    }
    
    if (priority) {
      params.Priority = priority;
    }
    if (semester !== undefined && semester !== null) {
      params.Semester = semester.toString();
    }
    
    return this.get(`${this.apiUrl}/ListByClass`, params);
  }

  getListBySchool(schoolYear: number, grade?: number, type?: string): Observable<any> {
    let params: any = {
      SchoolYear: schoolYear.toString()
    };
    if (grade) {
      params.Grade = grade.toString();
    }
    if (type) {
      params.Type = type;
    }
    return this.get(`${this.apiUrl}/ListBySchool`, params);
  }

  countByClass(classId: string, schoolYear: number, type?: string): Observable<any> {
    let params: any = {
      ClassId: classId,
      SchoolYear: schoolYear.toString()
    };
    if (type) {
      params.Type = type;
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
}