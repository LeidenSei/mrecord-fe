import { CommonModule } from '@angular/common';
import { Component, NgModule, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { LoginOauthModule } from 'src/app/components/library/login-oauth/login-oauth.component';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxButtonModule, DxButtonTypes } from 'devextreme-angular/ui/button';
import notify from 'devextreme/ui/notify';
import { AuthService, IResponse, ThemeService } from 'src/app/services';
import {NotificationService} from "../../../services/notification.service";
import {DxSelectBoxModule} from "devextreme-angular";
import {GeneralService} from "../../../services/general.service";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  @Input() resetLink = '/auth/reset-password';
  @Input() createAccountLink = '/auth/create-account';

  defaultAuthData: IResponse;

  btnStylingMode: DxButtonTypes.ButtonStyle;

  passwordMode = 'password';

  loading = false;

  formData: any = {email: '', password: ''};

  passwordEditorOptions = {
    placeholder: 'Mật khẩu',
    stylingMode:'filled',
    mode: this.passwordMode,
    value: '',
  }
  loginType: number;
  loginTypeSource = [
    {id: 1, name: 'Tài khoản mSchool'},
    {id: 2, name: 'Tài khoản Sở Giáo dục và Đào tạo TPHCM'}
  ];
  accountType: number;
  accountTypeSource = [
    {id: 1, name: 'Giáo viên'},
    {id: 2, name: 'Học sinh'}
  ];
  schoolSource = [];
  schoolId: any;
  constructor(private authService: AuthService, private router: Router, private themeService: ThemeService,
              private notificationService: NotificationService,
              private generalService: GeneralService
              ) {
    this.themeService.isDark.subscribe((value: boolean) => {
      this.btnStylingMode = value ? 'outlined' : 'contained';
    });
    this.loginType = 1;
    this.accountType = 1;
    this.generalService.getHCMSchools().subscribe((resInfo: any) => {
     this.schoolSource = resInfo;
    });
  }

  changePasswordMode() {
    debugger;
    this.passwordMode = this.passwordMode === 'text' ? 'password' : 'text';
  };

  async onSubmit(e: Event) {
    e.preventDefault();
    const { email, password } = this.formData;
    this.loading = true;
    this.authService.login({username: email, password: password}).subscribe(res => {
      this.authService.getUserInfo(res.token).subscribe((resInfo: any) => {
        res.fullname = resInfo.name;
        res.schoolName = resInfo.schoolName;
        res.schoolId = resInfo.schoolId;
        res.students = resInfo.students;
        res.toTruongMon = resInfo.toTruongMon;
        res.toTruongMonKhoi = resInfo.toTruongMonKhoi;
        res.classId = resInfo.classId;
        res.isBGH = resInfo.isBGH;
        res.isGVCN = resInfo.isGVCN;
        res.personId = resInfo.id;
        res.currentYear = resInfo.currentYear;
        const result = this.authService.doLogIn(res);
        if (!result.isOk) {
          this.loading = false;
          notify(result.message, 'error', 2000);
        }
      });
    }, error => {
      this.loading = false;
      if (error.error.message){
        this.notificationService.showNotification('error', error.error.message);
      } else
      this.notificationService.showNotification('error', 'Không thể đăng nhập hệ thống lúc này. Vui lòng liên hệ quản trị viên');
      //notify('Không thể đăng nhập hệ thống lúc này. Vui lòng liên hệ quản trị viên', 'error', 2000);
    });

   /* const result = await this.authService.logIn(email, password);
    this.loading = false;
    if (!result.isOk) {
      notify(result.message, 'error', 2000);
    }*/
  }

  onCreateAccountClick = () => {
    this.router.navigate([this.createAccountLink]);
  };

  async ngOnInit(): Promise<void> {
    this.defaultAuthData = await this.authService.getUser();

  }

  accountTypeChange($event:number) {
    if ($event == 2){
      this.generalService.ssoLoginModel().subscribe((res: any) => {
        console.log(res);
        location.href = res.result;
      });
    }
  }

  schoolSourceChange(schoolId) {
    /*this.generalService.getGiaoVienTokenSSO(schoolId).subscribe((res: any) => {
      location.href = res.result;
    });*/
  }

  doRedirect($event) {
    this.generalService.getGiaoVienTokenSSO(this.schoolId).subscribe((res: any) => {
      location.href = res.result;
    });
  }
}
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LoginOauthModule,
    DxFormModule,
    DxLoadIndicatorModule,
    DxButtonModule,
    DxSelectBoxModule
  ],
  declarations: [LoginFormComponent],
  exports: [LoginFormComponent],
})
export class LoginFormModule { }
