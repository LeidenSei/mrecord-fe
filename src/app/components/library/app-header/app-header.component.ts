import {Component, EventEmitter, HostListener, Input, NgModule, OnInit, Output, ViewChild,} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DxButtonModule} from 'devextreme-angular/ui/button';
import {DxToolbarModule} from 'devextreme-angular/ui/toolbar';

import {UserPanelModule} from '../user-panel/user-panel.component';
import {AuthService} from 'src/app/services';
import {ThemeSwitcherModule} from 'src/app/components/library/theme-switcher/theme-switcher.component';

import {
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownButtonModule,
  DxFileUploaderComponent,
  DxFileUploaderModule,
  DxFormModule,
  DxLoadPanelModule,
  DxPopupModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule
} from "devextreme-angular";
import {ReactiveFormsModule} from "@angular/forms";
import {GeneralService} from "../../../services/general.service";
import {NotificationService} from "../../../services/notification.service";
import {Constant} from "../../../shared/constants/constant.class";
import {AppConfigService} from "../../../app-config.service";
import {confirm} from "devextreme/ui/dialog";
declare const Base64: any;
declare const vgca_sign_xml: any;
declare const vgca_sign_msg: any;
@Component({
  selector: 'app-header',
  templateUrl: 'app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})

export class AppHeaderComponent implements OnInit {
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title!: string;

  user: any;
  isPopupChangePasswordOpened = false;
  userMenuItems = [
    {
      text: 'Cấu hình chữ ký số',
      icon: 'key',
      onClick: () => {
        //this.isPopupChangePasswordOpened = true;
        this.showConfig();
      },
    },
    {
      text: 'Đăng xuất',
      icon: 'runner',
      onClick: () => {
        this.authService.logOut();
      },
    }
  ];
  newUser: any;
  width = 480;
  selectedStudentId: any;
  students = [];
  isPortrait: boolean;
  screenWidth: number;
  isShowConfig = false;
  isShowConfigStaff = false;
  schoolInfo: any;
  staffInfo: any;
  uploadHeaders: any;
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  previewVisible = false;
  positionSource: any[] = [];
  signatureProviderSource: any[] = [];
  isCertPopupVisible = false;
  certInfo: any;
  @ViewChild("fileUploader", {static: false}) fileUploader: DxFileUploaderComponent;

  constructor(private authService: AuthService,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private generalService: GeneralService) {
    this.newUser = {
      oldPassword: '', password: '', repeatPassword: ''
    };
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.staffInfo = {};
    this.certInfo = {};
    this.schoolInfo = {
      ngayKyHocBa: null
    }
    this.positionSource = [{text: 'Hiệu trưởng'}, {text: 'Phó hiệu trưởng'}];
    this.signatureProviderSource = [{text: 'Vietel MySign', id: 0}, {text: 'Ban cơ yếu chính phủ', id: 1}];
  }

  ngOnInit() {
    this.authService.getUser().then((e) => {
      this.user = e.data;
      if (this.user.isNotUsingLMS) {
        alert('Bạn chưa đăng ký sử dụng dịch vụ. Vui lòng liên hệ với admin trường để được xử lý. Xin cảm ơn!');
        this.authService.logOut();
      }
      if (this.user.role !== 12) {
        if (!this.user.currentYear || !this.user.personId) {
          this.authService.getUserInfo(this.user.token).subscribe((resInfo: any) => {
            if (!this.user.personId)
              this.user.personId = resInfo.id;
            if (!this.user.currentYear)
              this.user.currentYear = resInfo.currentYear;
            const result = this.authService.doLogIn(this.user);
            if (result.isOk) {
              window.location.reload();
            }
          });
        }
      } else {
        if (this.user.isNotUsingLMS !== false && this.user.isNotUsingLMS !== true) {
          this.authService.getUserInfo(this.user.token).subscribe((resInfo: any) => {
            this.user.students = resInfo.students;
            const result = this.authService.doLogIn(this.user);
            if (result.isOk) {
              window.location.reload();
            }
          });
        }
      }

      //console.log(this.user);
      if (this.user.role === 12) {
        this.students = this.user.students;
        this.students.forEach(en => {
          en.fullName = en.name + ' (' + en.className + ')';
        });
        this.selectedStudentId = this.user.studentId;
      }
    });
    this.authService.validate().subscribe(res => {
      if (res.ret && res.ret[0].code === 401) {
        localStorage.removeItem(Constant.TOKEN);
        localStorage.removeItem(Constant.USER_INFO);
        //this.route.navigate(['/login']);
        location.href = '/auth/login';
      }
    }, error => {
      localStorage.removeItem(Constant.TOKEN);
      localStorage.removeItem(Constant.USER_INFO);
      //this.route.navigate(['/login']);
      location.href = '/auth/login';
    });
    this.checkOrientation();
  }

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  isSmallScreen(): boolean {
    return this.screenWidth < 430;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.checkOrientation();  // Kiểm tra orientation khi thay đổi kích thước cửa sổ
  }

  checkOrientation() {
    this.screenWidth = window.innerWidth;
    if (window.matchMedia("(orientation: portrait)").matches) {
      this.isPortrait = true;
      console.log('Device is in Portrait mode');
    } else {
      this.isPortrait = false;
      console.log('Device is in Landscape mode');
    }
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  };

  onClickChangePassword() {

  }

  async onSaveChange() {
    if (this.validationGroup.instance.validate().isValid)
      this.generalService.changePassword(this.newUser).subscribe(res => {
        console.log(res);
        if (res.ret && res.ret[0].code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Đổi mật khẩu thành công');
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.ret[0].message);
        }
        this.isPopupChangePasswordOpened = false;
      }, error => {
        console.log(error.error.errors);
      });
  }

  closeChangePassword() {
    this.isPopupChangePasswordOpened = false;
  }

  close() {
    location.href = '/#/mvp/close';
    location.reload();
  }

  selectedStudent($event: any) {
    if ($event !== this.selectedStudentId) {
      //set selected student
      let student = this.user.students.find(en => en.id === $event);
      this.user.studentId = student.id;
      this.user.fullname = student.name;
      this.user.schoolId = student.schoolId;
      this.user.schoolName = student.schoolName;
      this.user.classId = student.classId;
      this.user.currentYear = student.currentYear;
      this.user.isNotUsingLMS = student.isNotUsingLMS;
      console.log(this.user);
      localStorage.setItem(Constant.USER_INFO, JSON.stringify(this.user));
      //location.href = '/student/class-course';
      window.location.reload()
    }
  }

  showConfig() {
    console.log(this.user);
    if (this.user.role === 2) {
      this.isShowConfig = true;
      this.generalService.getSchoolConfig(this.user.schoolId).subscribe((res: any) => {
        this.schoolInfo = res;

      }, error => {

      });
    } else if (this.user.role === 3 || this.user.role === 9) {
      this.isShowConfigStaff = true;
      this.generalService.getStaffById(this.user.personId).subscribe(res => {
        this.staffInfo = res;
      }, error => {

      });
    }

  }

  onUploadFileStarted(e: any) {
    console.log('Upload started:', e);
    const item = e.file;
    const fileName = item.name;
    const parts = fileName.split('.');
    let fileExt = parts.length > 1 ? parts.pop() : '';
    return false;
  }

  onFileUploaded(e: any, fieldName: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      this.schoolInfo[fieldName] = res.url;
    }
    // Thực hiện các hành động tùy chỉnh khi upload hoàn tất
  }

  onStaffFileUploaded(e: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      this.staffInfo.signUrl = res.url;
    }
    // Thực hiện các hành động tùy chỉnh khi upload hoàn tất
  }

  onFileUploadError(e: any) {
    console.error('Upload error:', e);
    // Thực hiện các hành động tùy chỉnh khi upload gặp lỗi
  }

  onFileSelected(e: any) {
    const file = e.value?.[0];

    if (file && file.size > 500000) {
      alert('❌ File vượt quá 500KB, vui lòng chọn file nhỏ hơn!');
      e.component.reset(); // Xoá file khỏi uploader
    }
  }

  openPreview() {
    this.previewVisible = true;
  }

  onSaveConfig() {
    this.generalService.saveSchoolConfig(this.schoolInfo).subscribe(en => {
      if (en.code === 0) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Lưu cấu hình chữ ký thành công');
        this.isShowConfig = false;
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Có lỗi xảy ra!');
      }
    }, error => {

    });
  }

  onSaveStaffConfig() {
    this.generalService.saveStaff(this.staffInfo).subscribe(en => {
      if (en.code === 0) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Lưu cấu hình chữ ký số thành công');
        this.isShowConfigStaff = false;
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Có lỗi xảy ra!');
      }
    }, error => {

    });
  }
  async getCTS() {
    const sender = document.getElementById("btn-sign");
    const prms = {};
    const hash_alg = "SHA256";
    prms["HashAlg"] = hash_alg;
    prms["HashValue"] = 'nxUr1a6P0JXEBtmpNRwJPy/Twc+22fIeqh1R9jYVqmA=';
    prms["Encode"] = "RSA";
    let json_prms = JSON.stringify(prms);

    vgca_sign_msg(sender, json_prms, (sender: any, res: any) => {
      let rv = JSON.parse(res);
      if (rv && rv.Status == 0) {
        this.generalService.getCertBCYInfo({
          certBase64: rv.CertBase64,
        }).subscribe(res => {
          //console.log(res);
          this.isCertPopupVisible = true;
          this.certInfo = res;
          this.certInfo.cert = rv.CertBase64;
        });
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Lấy chứng thư số không thành công');
        this.staffInfo.certInfo = ".";
      }
    });
  }

  cancelCert() {
    this.isCertPopupVisible = false;
  }

  confirmCert() {
    this.staffInfo.certInfo = this.certInfo.cert;
    this.isCertPopupVisible = false;
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxToolbarModule,
    ThemeSwitcherModule,
    UserPanelModule,
    DxToolbarModule,
    DxScrollViewModule,
    DxLoadPanelModule,
    DxTextBoxModule,
    DxPopupModule,
    /*FormTextboxModule,*/
    /*FormPhotoUploaderModule,*/
    DxValidatorModule,
    DxFormModule,
    ReactiveFormsModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxValidationGroupModule,
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxDateBoxModule
  ],
  declarations: [AppHeaderComponent],
  exports: [AppHeaderComponent],
})
export class AppHeaderModule {
}
