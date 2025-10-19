import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../app-config.service';
import { BaseService } from './base-service.service';

export interface CommitteeMemberDto {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  positionId: string;
  positionName: string;
  teamNumber?: number;
  schoolYear: string;
  electionRound: number;
  electionDate: Date;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  responsibilities?: string;
  notes?: string;
}

export interface CreateCommitteeRequest {
  classId: string;
  studentIds: string[];
  positionIds: string[];
  schoolYear: string;
  electionRound: number;
}

export interface UpdateCommitteeRequest {
  id: string;
  positionId: string;
  teamNumber?: number;
  electionRound: number;
  responsibilities?: string;
  notes?: string;
}

export interface BulkUpdatePositionRequest {
  committeeIds: string[];
  newPositionIds: string[];
}

export interface DeactivateCommitteeRequest {
  committeeIds: string[];
  endDate?: Date;
}

export interface BaseResponse {
  code: number;
  message: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommitteeService extends BaseService {
  private apiUrl = '/ClassCommittee';

  constructor(
    httpClient: HttpClient,
    configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  getListByClass(
    classId: string,
    schoolYear: string,
    electionRound?: number,
    activeOnly?: boolean
  ): Observable<CommitteeMemberDto[]> {
    const params: any = {
      classId,
      schoolYear
    };

    if (electionRound !== undefined && electionRound > 0) {
      params.electionRound = electionRound.toString();
    }

    if (activeOnly !== undefined) {
      params.activeOnly = activeOnly.toString();
    }

    return this.get(`${this.apiUrl}/ListByClass`, params);
  }

  getHistoryByStudent(studentId: string): Observable<CommitteeMemberDto[]> {
    return this.get(`${this.apiUrl}/HistoryByStudent`, { studentId });
  }

  createBulk(request: CreateCommitteeRequest): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/CreateBulk`, request);
  }

  update(request: UpdateCommitteeRequest): Observable<BaseResponse> {
    return this.put(`${this.apiUrl}/Update`, request);
  }

  bulkUpdatePosition(request: BulkUpdatePositionRequest): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/BulkUpdatePosition`, request);
  }

  deactivate(request: DeactivateCommitteeRequest): Observable<BaseResponse> {
    return this.post(`${this.apiUrl}/Deactivate`, request);
  }

    deleteCommittee(id: string): Observable<BaseResponse> {
    return this.httpClient.delete<BaseResponse>(
        this.configService.getConfig().api.baseUrl + `${this.apiUrl}/Delete?id=${id}`,
        {
        headers: this.createHeaders()
        }
    );
    }
  hardDelete(id: string): Observable<BaseResponse> {
    return this.delete(`${this.apiUrl}/HardDelete`, id);
  }
}