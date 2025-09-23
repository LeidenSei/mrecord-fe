import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEditorModel, IPlayerModel, IContentMetadata } from '@lumieducation/h5p-server';
import {H5pAuthenService} from "./h5p-authen-service";

export interface ContentListEntry {
  contentId: string;
  mainLibrary: string;
  title: string;
  role: number;
}

@Injectable({
  providedIn: 'root',
})
export class H5pContentService {
  private baseUrl = '/h5p';  // Proxy sẽ chuyển hướng các request này đến đúng endpoint

  constructor(private http: HttpClient, private authService: H5pAuthenService) {}

  // Lấy danh sách nội dung
  list(): Observable<ContentListEntry[]> {
    console.log(`ContentService: Listing content objects`);
    return this.http.get<ContentListEntry[]>(this.baseUrl);
  }

  // Xóa nội dung
  delete(contentId: string): Observable<void> {
    console.log(`ContentService: deleting ${contentId}...`);
    const headers = new HttpHeaders().set('CSRF-Token', this.authService.getCsrfToken() || '');
    return this.http.delete<void>(`${this.baseUrl}/${contentId}`, { headers });
  }

  // Lấy dữ liệu để chỉnh sửa
  getEdit(contentId: string): Observable<IEditorModel> {
    console.log(`ContentService: Getting information to edit ${contentId}...`);
    return this.http.get<IEditorModel>(`${this.baseUrl}/${contentId}/edit`);
  }

  // Lấy dữ liệu để chơi nội dung
  getPlay(contentId: string, contextId?: string, asUserId?: string, readOnlyState?: boolean): Observable<IPlayerModel> {
    console.log(`ContentService: Getting information to play ${contentId}`);
    let params: any = {};
    if (contextId) params.contextId = contextId;
    if (asUserId) params.asUserId = asUserId;
    if (readOnlyState) params.readOnlyState = 'yes';

    return this.http.get<IPlayerModel>(`${this.baseUrl}/${contentId}/play`, { params });
  }

  // Lưu nội dung
  save(contentId: string, requestBody: { library: string; params: any }): Observable<{ contentId: string; metadata: IContentMetadata }> {
    console.log(`ContentService: Saving content ${contentId}`);
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('CSRF-Token', this.authService.getCsrfToken() || '');
    const body = JSON.stringify(requestBody);

    return contentId
      ? this.http.patch<{ contentId: string; metadata: IContentMetadata }>(`${this.baseUrl}/${contentId}`, body, { headers })
      : this.http.post<{ contentId: string; metadata: IContentMetadata }>(this.baseUrl, body, { headers });
  }

  // Tạo đường dẫn tải xuống
  generateDownloadLink(contentId: string): string {
    return `${this.baseUrl}/download/${contentId}`;
  }
}
