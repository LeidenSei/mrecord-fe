import {ChangeDetectorRef, Component} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../services";
import {GeneralService} from "../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";
import {AppConfigService} from "../../app-config.service";
import {Constant} from "../../shared/constants/constant.class";
import notify from "devextreme/ui/notify";

@Component({
  selector: 'app-sgd-sso',
  templateUrl: './sgd-sso.component.html',
  styleUrls: ['./sgd-sso.component.scss']
})
export class SgdSsoComponent {
  errorMessage: any;
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    const url = location.href;
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const token = urlParams.get('token');

    const ischoolToken =  urlParams.get('ischoolToken');
    const studentId = urlParams.get('studentId');
    if (ischoolToken){
      let payload = {
        ischoolToken
      }
      this.generalService.mSchoolLogin(payload).subscribe(res => {
        //console.log('ssoLogin', res);
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
          if (studentId){
            res.studentId = studentId;
          }
          const result = this.authService.doLogIn(res);
          if (!result.isOk) {
            notify(result.message, 'error', 2000);
            this.errorMessage = `${JSON.stringify(payload)}`;
            this.logOut();
          }
        });
      }, error => {
          this.errorMessage = `${JSON.stringify(error)} ${JSON.stringify(payload)}`;
          this.logOut();
      });
    }
    if (token) {
      let payload = {
        gdToken: token
      }
      this.generalService.ssoLogin(payload).subscribe(res => {
        //console.log('ssoLogin', res);
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
          res.gdToken = token;
          const result = this.authService.doLogIn(res);
          if (!result.isOk) {
            notify(result.message, 'error', 2000);
          }
        });
      }, error => {
      });
    }
  }
  logOut() {
    localStorage.removeItem(Constant.TOKEN);
    localStorage.removeItem(Constant.USER_INFO);
    this.router.navigate(['/auth/login']);
  }
}
