import { Injectable } from '@angular/core';

@Injectable()
export class AppInfoService {
  constructor() {}

  public get title() {
    return 'mRecord - Sổ và tài liệu giảng dạy';
  }

  public get currentYear() {
    return new Date().getFullYear();
  }
}
