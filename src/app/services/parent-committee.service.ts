import { Injectable } from "@angular/core";
import { BaseService } from "./base-service.service";
import { HttpClient } from "@angular/common/http";
import { AppConfigService } from "../app-config.service";
import { Observable } from "rxjs";

export interface ParentCommitteeDto {
  id: string;
  stt: number;
  parentId: string;
  parentName: string;
  parentPhone: string;
  workplace: string;
  studentId: string;
  studentName: string;
  position: string;
  relationship: string;
  note: string;
}

export interface ParentCommitteeRequest {
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  workplace?: string;
  studentId: string;
  classId: string;
  schoolYearId: number;
  position: string;
  relationship: string;
  note?: string;
}

export interface ParentCommitteeUpdateRequest {
  id: string;
  position: string;
  relationship: string;
  note?: string;
  workplace: string
}

export interface ParentCommitteeResponse {
  errorCode: number;
  message: string;
  data?: any;
  code:any
}

@Injectable({
  providedIn: 'root'
})
export class ParentCommitteeService extends BaseService {

   private readonly API_URL = '/ParentCommittee';  

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
    super(httpClient, configService);
  }

  getListByClass(classId: string, schoolYearId: number, positionFilter: string = ''): Observable<ParentCommitteeDto[]> {
    const params: any = {
      classId: classId,
      schoolYearId: schoolYearId.toString()
    };
    
    if (positionFilter) {
      params.positionFilter = positionFilter;
    }
    return this.get(`${this.API_URL}/ListByClass`, params);
  }

  create(request: ParentCommitteeRequest): Observable<ParentCommitteeResponse> {
    return this.post(this.API_URL, request);
  }

  update(request: ParentCommitteeUpdateRequest): Observable<ParentCommitteeResponse> {
    return this.put(this.API_URL, request);
  }

  remove(id: string): Observable<ParentCommitteeResponse> {
    return super.delete(`${this.API_URL}/${id}`, id);
  }
}