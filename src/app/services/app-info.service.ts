import { Injectable } from '@angular/core';

@Injectable()
export class AppInfoService {
  constructor() {}

  public get title() {
    return 'mProfile - Cơ sở dữ liệu học bạ số';
  }

  public get currentYear() {
    return new Date().getFullYear();
  }
}
