import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {AppConfigService} from "../app-config.service";
import {Constant} from "../shared/constants/constant.class";

@Injectable()
export class BaseService {

  constructor(
    public httpClient: HttpClient,
    protected configService: AppConfigService
  ) {
  }
  get(url: string, params?: {}, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.get(this.configService.getConfig().api.baseUrl + url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params,
          responseType: 'text',
        });
      case 'blob':
        return this.httpClient.get(this.configService.getConfig().api.baseUrl + url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params,
          responseType: 'blob',
        });
      default:
        return this.httpClient.get(this.configService.getConfig().api.baseUrl + url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params
        });
    }
  }

  /**
   * Create a new entity.
   * @param url the api url
   * @param data the entity to create
   */
  post(url: string, data: any, params?: {}, responseType?: string): Observable<any> {
    //console.log(this.configService.getConfig().api.baseUrl + url);
    switch (responseType) {
      case 'text':
        return this.httpClient.post(this.configService.getConfig().api.baseUrl + url, data, {
          headers: this.createHeaders() || {},
          responseType: 'text',
          params
        });
      case 'blob':
        return this.httpClient.post(this.configService.getConfig().api.baseUrl + url, data, {
          headers: this.createHeaders() || {},
          responseType: 'blob',
          params
        });
      case 'arraybuffer':
        return this.httpClient.post(this.configService.getConfig().api.baseUrl + url, data, {
          headers: this.createHeaders() || {},
          responseType: 'blob',
          params
        });
      default:
        return this.httpClient.post(this.configService.getConfig().api.baseUrl + url, data, {
          headers: this.createHeaders() || {},
          params
        });
    }
  }

  /**
   * Update an entity.
   * @param url the api url
   * @param data the entity to be updated
   */
  put(url: string, data: any, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.put(this.configService.getConfig().api.baseUrl + url, data, {
          headers: this.createHeaders() || {},
         responseType: 'text'
        });
      default:
        return this.httpClient.put(this.configService.getConfig().api.baseUrl + url, data, {
          headers: this.createHeaders() || {},
        });
    }
  }

  /**
   * Delete an entity.
   * @param url the api url
   * @param id the entity id to be deleted
   */
  delete(url: string, id: any, responseType?: string): Observable<any> {
    const params = { Id: id };
    switch (responseType) {
      case 'text':
        return this.httpClient.delete(this.configService.getConfig().api.baseUrl + url, {
          headers: this.createHeaders() || {},
          params: params,
          responseType: 'text'
        });
      default:
        return this.httpClient.delete(this.configService.getConfig().api.baseUrl + url, {
          headers: this.createHeaders() || {},
          params: params
        });
    }
  }
  deleteExternal(url: string, id: any, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.delete(url, {
          headers: this.createHeaders() || {},
          responseType: 'text'
        });
      default:
        return this.httpClient.delete(url, {
          headers: this.createHeaders() || {},
        });
    }
  }

  public createHeaders() {
    // Why "authorization": see CustomLogoutSuccessHandler on server
    return new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
  }
  private getToken() {
    return  localStorage.getItem(Constant.TOKEN);
  }

  getExternal(url: string, params?: {}, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.get(url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params,
          responseType: 'text',
        });
      case 'blob':
        return this.httpClient.get(url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params,
          responseType: 'blob',
        });
      default:
        return this.httpClient.get(url, {
          headers: this.createHeaders().set('skipLoading', 'true') || {},
          params
        });
    }
  }
  postExternal(url: string, data: any, params?: {}, responseType?: string): Observable<any> {
    switch (responseType) {
      case 'text':
        return this.httpClient.post(url, data, {
          headers: this.createHeaders() || {},
          responseType: 'text',
          params
        });
      case 'blob':
        return this.httpClient.post(url, data, {
          headers: this.createHeaders() || {},
          responseType: 'blob',
          params
        });
      case 'arraybuffer':
        return this.httpClient.post(url, data, {
          headers: this.createHeaders() || {},
          responseType: 'blob',
          params
        });
      default:
        return this.httpClient.post(url, data, {
          headers: this.createHeaders() || {},
          params
        });
    }
  }
}
