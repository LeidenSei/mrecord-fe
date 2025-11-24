import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

export interface TeacherAnnualReportDto {
  id: string;
  teacherId: string;
  teacherName: string;
  schoolId: string;
  schoolYear: number;
  mainClassId: string;
  mainClassName: string;
  reportType: number;
  selfAssessment: SelfAssessmentReportDto;
  innovations: InnovationReportDto[];
  status: number;
  submittedDate?: Date;
  approvedDate?: Date;
  approvedBy?: string;
  approverName?: string;
  approvalComments?: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface SelfAssessmentReportDto {
  profile: ProfileInfoDto;
  achievement: AchievementInfoDto;
  performanceIndicators: PerformanceIndicatorDto[];
  additional: AdditionalInfoDto;
}

export interface ProfileInfoDto {
  age: number;
  gender: string;
  yearsOfExperience: number;
  mainSubject: string;
  homeRoomClass: string;
  teamRanking: string;
  unionRanking: string;
  workingConditions: string;
}

export interface AchievementInfoDto {
  homeRoomTeamRanking: string;
  yearlyActivities: string;
  effectiveMethods: string;
}

export interface PerformanceIndicatorDto {
  order: number;
  indicatorName: string;
  startOfYearPercent: number;
  endOfYearPercent: number;
}

export interface AdditionalInfoDto {
  collectiveActivities: string;
  selfManagementStrengths: string;
  classTraditions: string;
}

export interface InnovationReportDto {
  id?: string;
  title: string;
  subject: string;
  appliedToClass: string;
  theoreticalBasis: string;
  implementationMethods: string;
  results: string;
  lessonsLearned: string;
  createdDate?: Date;
}

export interface CreateTeacherAnnualReportRequest {
  schoolYear: number;
  mainClassId: string;
  reportType: number;
}

export interface UpdateTeacherAnnualReportRequest {
  id: string;
  selfAssessment?: SelfAssessmentReportDto;
  innovations?: InnovationReportDto[];
}

export interface SubmitReportRequest {
  reportId: string;
}

export interface ApproveReportRequest {
  reportId: string;
  comments: string;
}

export interface BaseResponse {
  code: number;
  status: string;
  message: string;
}

export enum TeacherReportType {
  SelfAssessment = 1,
  Innovation = 2,
  Both = 3
}

export enum TeacherReportStatus {
  Draft = 0,
  Submitted = 1,
  UnderReview = 2,
  Approved = 3,
  Rejected = 4,
  NeedRevision = 5
}

@Injectable({
  providedIn: 'root'
})
export class TeacherAnnualReportService extends BaseService {

  private readonly API_URL = '/TeacherAnnualReport';

  constructor(
    httpClient: HttpClient,
    configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  get(id: string): Observable<TeacherAnnualReportDto> {
    return super.get(`${this.API_URL}`, { Id: id });
  }

  getListBySchool(schoolId: string, schoolYear: number, status?: number): Observable<TeacherAnnualReportDto[]> {
    const params: any = { SchoolId: schoolId, SchoolYear: schoolYear };
    if (status !== undefined && status !== null) {
      params.Status = status;
    }
    return super.get(`${this.API_URL}/ListBySchool`, params);
  }

  getListByTeacher(teacherId: string, schoolYear?: number): Observable<TeacherAnnualReportDto[]> {
    const params: any = { TeacherId: teacherId };
    if (schoolYear) {
      params.SchoolYear = schoolYear;
    }
    return super.get(`${this.API_URL}/ListByTeacher`, params);
  }

  getMyReports(schoolYear?: number): Observable<TeacherAnnualReportDto[]> {
    const params: any = {};
    if (schoolYear) {
      params.SchoolYear = schoolYear;
    }
    return super.get(`${this.API_URL}/MyReports`, params);
  }

  create(request: CreateTeacherAnnualReportRequest): Observable<BaseResponse> {
    return super.post(`${this.API_URL}/Create`, request);
  }

  update(request: UpdateTeacherAnnualReportRequest): Observable<BaseResponse> {
    return super.post(`${this.API_URL}/Update`, request);
  }

  submit(request: SubmitReportRequest): Observable<BaseResponse> {
    return super.post(`${this.API_URL}/Submit`, request);
  }

  approve(request: ApproveReportRequest): Observable<BaseResponse> {
    return super.post(`${this.API_URL}/Approve`, request);
  }

  reject(request: ApproveReportRequest): Observable<BaseResponse> {
    return super.post(`${this.API_URL}/Reject`, request);
  }

  requestRevision(request: ApproveReportRequest): Observable<BaseResponse> {
    return super.post(`${this.API_URL}/RequestRevision`, request);
  }

  deleteReport(id: string): Observable<BaseResponse> {
    return super.delete(`${this.API_URL}/Delete?Id=${id}`, null);
  }

  getStatusText(status: number): string {
    switch (status) {
      case TeacherReportStatus.Draft:
        return 'Bản nháp';
      case TeacherReportStatus.Submitted:
        return 'Đã nộp';
      case TeacherReportStatus.UnderReview:
        return 'Đang xét duyệt';
      case TeacherReportStatus.Approved:
        return 'Đã phê duyệt';
      case TeacherReportStatus.Rejected:
        return 'Từ chối';
      case TeacherReportStatus.NeedRevision:
        return 'Yêu cầu chỉnh sửa';
      default:
        return 'Không xác định';
    }
  }

  getReportTypeText(type: number): string {
    switch (type) {
      case TeacherReportType.SelfAssessment:
        return 'Tự báo cáo thành tích';
      case TeacherReportType.Innovation:
        return 'Sáng kiến kinh nghiệm';
      case TeacherReportType.Both:
        return 'Cả hai mẫu';
      default:
        return 'Không xác định';
    }
  }
}