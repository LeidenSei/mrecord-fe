import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs';

interface LoginResponse {
  username: string;
  email: string;
  name: string;
  csrfToken: string;
}
@Injectable({
  providedIn: 'root'
})
export class H5pAuthenService {
  private loginUrl = '/login'; // Đường dẫn tới API đăng nhập
  private csrfToken: string | undefined;
  private userInfo: Partial<LoginResponse> | undefined;

  constructor(private http: HttpClient) {}

  // Hàm login và lưu csrfToken
  login(username: string, password: string): Observable<LoginResponse> {
    return new Observable((observer) => {
      this.http.post<LoginResponse>(this.loginUrl, { username, password })
        .subscribe(
          (response) => {
            // Lưu thông tin người dùng và CSRF token
            this.csrfToken = response.csrfToken;
            this.userInfo = {
              username: response.username,
              email: response.email,
              name: response.name,
            };

            console.log('Logged in and CSRF token saved:', this.csrfToken);
            observer.next(response); // Trả về dữ liệu đăng nhập
            observer.complete();
          },
          (error) => {
            observer.error(error); // Xử lý lỗi
          }
        );
    });
  }

  // Trả về csrfToken
  getCsrfToken(): string | undefined {
    return this.csrfToken;
  }

  // Trả về thông tin người dùng
  getUserInfo(): Partial<any> | undefined {
    return this.userInfo;
  }
}
