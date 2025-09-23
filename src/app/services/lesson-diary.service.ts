import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseService} from "./base-service.service";
import {UrlConstant} from "../shared/constants/url.class";

@Injectable({
  providedIn: 'root'
})
export class LessonDiaryService extends BaseService {

  getSchedulesByTeacher(payload: any): Observable<any[]> {
    return this.get('/Schedule/ListScheduleByTeacher', payload);
  }
}
