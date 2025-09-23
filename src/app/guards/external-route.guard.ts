import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ExternalRouteGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const url = this.router.url;

    // Kiểm tra nếu URL bắt đầu với /login hoặc /h5p
    if (url.startsWith('/loginH5p') || url.startsWith('/h5p')) {
      window.location.href = url;
      return false; // Ngăn Angular xử lý route này
    }
    return true;
  }
}
