import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {
  private mobileScreenSubject = new BehaviorSubject<boolean>(window.innerWidth <= 600);
  isMobileScreen$ = this.mobileScreenSubject.asObservable();

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth <= 600;
    this.mobileScreenSubject.next(isMobile);
  }
}
