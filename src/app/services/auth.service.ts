import {Injectable} from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot} from '@angular/router';
import {Constant} from "../shared/constants/constant.class";
import {Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "../app-config.service";

export interface IUser {
  fullname: string;
  id: string;
  role: number;
  email: string;
  avatarUrl?: string;
  token: string;
  username: string;
  schoolId: string;
  schoolName: string;
  students: any[];
  toTruongMon: any[];
  toTruongMonKhoi: any[];
  isBGH: any;
  classId: any;
  studentId: any;
  schoolYear: number;
  personId: string;
  currentYear: number;
  isNotUsingLMS: boolean;
  isGVCN: any;
}

export interface IResponse {
  isOk: boolean;
  data?: IUser;
  message?: string;
}

const defaultPath = '/';
export const defaultUser: IUser = null;

@Injectable()
export class AuthService {
  private _user: IUser | null = null;

  get loggedIn(): boolean {
    const currentUser = localStorage.getItem(Constant.USER_INFO);
    if (currentUser) {
      this._user = JSON.parse(currentUser);
      this._user.avatarUrl = '/assets/images/avatar.png';
      return !!this._user;
    }
    return false;
  }

  private _lastAuthenticatedPath: string = defaultPath;

  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(private router: Router, private httpClient: HttpClient, private configService: AppConfigService) {
  }

  login(payload: any): Observable<any> {
    return this.httpClient.post(this.configService.getConfig().api.baseUrl + '/login', payload);
  }

  getUserInfo(token: string) {
    const headers = {
      Authorization: 'Bearer ' + token,
    }
    return this.httpClient.get(this.configService.getConfig().api.baseUrl + '/User/UserInfo', {headers});
  }

  validate(): Observable<any> {
    const headers = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN),
    }
    let token = localStorage.getItem(localStorage.getItem(Constant.TOKEN));
    token = 'Bearer ' + localStorage.getItem(Constant.TOKEN);
    return this.httpClient.post(this.configService.getConfig().api.baseUrl + '/login/validate', token, {headers});
  }

  doLogIn(resultLogin: any) {
    //console.log(resultLogin);
    if (resultLogin !== null && !resultLogin.message) {
      if (resultLogin.role === 12) {
        let selectedStudent = resultLogin.students[0];
        if (resultLogin.studentId) {
          selectedStudent = resultLogin.students.find(en => en.id === resultLogin.studentId);
        }
        resultLogin.studentId = selectedStudent.id;
        resultLogin.fullname = selectedStudent.name;
        resultLogin.schoolId = selectedStudent.schoolId;
        resultLogin.schoolName = selectedStudent.schoolName;
        resultLogin.classId = selectedStudent.classId;
        resultLogin.currentYear = selectedStudent.currentYear;
        resultLogin.isNotUsingLMS = selectedStudent.isNotUsingLMS;
      }
      localStorage.setItem(Constant.TOKEN, resultLogin.token);
      localStorage.setItem(Constant.USER_INFO, JSON.stringify(resultLogin));
      this._user = resultLogin;
      if (resultLogin.role === 12) {
        this.router.navigate(['/student/class-course']);
      } else {
        this.router.navigate(['/common']);
      }
      return {
        isOk: true,
        data: this._user
      };
    } else {
      return {
        isOk: false,
        message: resultLogin.message
      };
    }
  }

  doLogInOnly(resultLogin: any) {
    //console.log(resultLogin);
    if (resultLogin !== null && !resultLogin.message) {
      if (resultLogin.role === 12) {
        let selectedStudent = resultLogin.students[0];
        if (resultLogin.studentId) {
          selectedStudent = resultLogin.students.find(en => en.id === resultLogin.studentId);
        }
        resultLogin.studentId = selectedStudent.id;
        resultLogin.fullname = selectedStudent.name;
        resultLogin.schoolId = selectedStudent.schoolId;
        resultLogin.schoolName = selectedStudent.schoolName;
        resultLogin.classId = selectedStudent.classId;
        resultLogin.currentYear = selectedStudent.currentYear;
        resultLogin.isNotUsingLMS = selectedStudent.isNotUsingLMS;
      }
      localStorage.setItem(Constant.TOKEN, resultLogin.token);
      localStorage.setItem(Constant.USER_INFO, JSON.stringify(resultLogin));
      this._user = resultLogin;
      return {
        isOk: true,
        data: this._user
      };
    } else {
      return {
        isOk: false,
        message: resultLogin.message
      };
    }
  }

  async getUser() {
    try {
      // Send request

      return {
        isOk: true,
        data: this._user,
      };
    } catch {
      return {
        isOk: false,
        data: null,
      };
    }
  }

  async createAccount(email: string, password: string) {
    try {
      // Send request
      this.router.navigate(['/auth/create-account']);
      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to create account',
      };
    }
  }

  async changePassword(email: string, recoveryCode: string) {
    try {
      // Send request

      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to change password',
      };
    }
  }

  async resetPassword(email: string) {
    try {
      // Send request

      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to reset password',
      };
    }
  }

  async logOut() {
    //this.router.navigate(['/auth/login']);
    localStorage.removeItem(Constant.TOKEN);
    localStorage.removeItem(Constant.USER_INFO);
    this._user = null;
    this.router.navigate(['/auth/login']);
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.loggedIn;
    /*const isAuthForm = [
      'login',
      'reset-password',
      'create-account',
      'change-password/:recoveryCode',
    ].includes(route.routeConfig?.path || defaultPath);*/
    if (!isLoggedIn) {
      this.router.navigate(['/auth/login']);
    }
    if (isLoggedIn) {
      this.authService.lastAuthenticatedPath = route.routeConfig?.path || defaultPath;
    }

    return isLoggedIn;
  }

  isLoggedIn(url?: string): boolean {
    const currentUser = localStorage.getItem(Constant.TOKEN);
    if (currentUser && currentUser !== Constant.TOKEN) {
      return true;
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login-form'], {queryParams: {returnUrl: url}});
    return false;
  }
}
