import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

@Injectable({
  providedIn: 'root'
})
export class ClassAnnualSummaryService extends BaseService {

  constructor(
    httpClient: HttpClient,
    configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  getById(id: string): Observable<any> {
    return this.get(`/ClassAnnualSummary/${id}`);
  }

  getByClass(classId: string, schoolYear: number): Observable<any> {
    return this.get('/ClassAnnualSummary/GetByClass', {
      classId,
      schoolYear
    });
  }

  getBySchool(schoolId: string, schoolYear: number, gradeLevel?: string): Observable<any> {
    return this.get('/ClassAnnualSummary/GetBySchool', {
      schoolId,
      schoolYear,
      gradeLevel
    });
  }

  create(data: any): Observable<any> {
    return this.post('/ClassAnnualSummary/Create', data);
  }

  update(data: any): Observable<any> {
    return this.post('/ClassAnnualSummary/Update', data);
  }

  updateTrainingQuality(data: any): Observable<any> {
    return this.post('/ClassAnnualSummary/UpdateTrainingQuality', data);
  }

  updateLearningQuality(data: any): Observable<any> {
    return this.post('/ClassAnnualSummary/UpdateLearningQuality', data);
  }

  updateStatistics(data: any): Observable<any> {
    return this.post('/ClassAnnualSummary/UpdateStatistics', data);
  }

  updateAchievements(data: any): Observable<any> {
    return this.post('/ClassAnnualSummary/UpdateAchievements', data);
  }

  updateAdditionalInfo(data: any): Observable<any> {
    return this.post('/ClassAnnualSummary/UpdateAdditionalInfo', data);
  }

  deleteSummary(id: string): Observable<any> {
    return this.delete(`/ClassAnnualSummary/${id}`, id);
  }
}
