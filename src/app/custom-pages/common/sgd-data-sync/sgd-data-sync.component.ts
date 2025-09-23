import {Component, OnInit} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {NotificationService} from "../../../services/notification.service";
import {Constant} from "../../../shared/constants/constant.class";
import {confirm} from "devextreme/ui/dialog";

@Component({
  selector: 'app-sgd-data-sync',
  templateUrl: './sgd-data-sync.component.html',
  styleUrls: ['./sgd-data-sync.component.scss']
})
export class SgdDataSyncComponent implements OnInit {
  msg: any;
  user: any = {};
  payload: any = {
    token: '',
    schoolCode: '',
    schoolYear: 2024
  };
  schoolInfo: any;
  isShowSignLoadingPrincipal = false;
  isElementary = false;
  isLoginSGD = false;
  schoolYearSource: any[] = [];
  filterSchoolYear = 2024;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private notificationService: NotificationService,
  ) {
    this.schoolYearSource = this.service.getYearSource();
  };

  async ngOnInit() {
    this.user = await this.authService.getUser();
    this.filterSchoolYear = this.user.data.currentYear;
    this.msg = this.user.data.gdToken;
    this.isLoginSGD = this.user.data.gdToken ? true : false;
    //console.log(this.user);
    //console.log('vao day');

    this.generalService.getSchoolConfig(this.user.data.schoolId).subscribe((res: any) => {
      this.schoolInfo = res;
      this.isElementary = res.type === 1;
      this.payload = {
        schoolId: this.user.data.schoolId,
        schoolCode: this.schoolInfo.gdId,
        schoolYear: this.filterSchoolYear,
        token: this.user.data.gdToken
      }
    }, error => {

    });
  }

  syncStudentList() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu học sinh năm học ${this.filterSchoolYear} - ${this.filterSchoolYear + 1} không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncDuLieuHocBaHocSinh(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });
  }

  syncClassList() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu lớp năm học ${this.filterSchoolYear} - ${this.filterSchoolYear + 1} không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncDuLieuLop(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });

  }

  fixClassId() {
    let result = confirm(`Bạn có chắc muốn cập nhật dữ liệu lớp năm học ${this.filterSchoolYear} - ${this.filterSchoolYear + 1} không`, 'Xác nhận đồng bộ');
    let payload = {
      schoolId: this.user.data.schoolId,
      schoolYear: this.filterSchoolYear,
    }
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.fixUpdateLopId(payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Dữ liệu được cập nhật thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Cập nhật dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });

  }

  syncDuLieuDiemTongKetTieuHoc() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu điểm tổng kết tiểu học không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncDuLieuDiemTongKetTieuHoc(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });

  }

  syncDuLieuNangLucPhamChat() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu năng lực phẩm chất tiểu học không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncDuLieuNangLucPhamChat(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });

  }

  //Cap 2
  syncDuLieuDiemMonHocC2() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu điểm môn học cấp 2 không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncDuLieuDiemMonHocC2(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });

  }

  syncDuLieuDiemTongKetC2() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu điểm tổng kết cấp 2 không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncDuLieuDiemTongKetC2(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });

  }

  clearSignedGVBM() {
    let result = confirm(`Bạn có chắc muốn xóa toàn bộ dữ liệu ký số của GVBM không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.clearSignedGVBM(this.user.data.schoolId, 2024).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, en.message);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });
  }

  syncDuLieuKhenThuong() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu khen thưởng không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.updateDuLieuHocBaKhenThuong(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });
  }

  schoolYearChange($event) {
    this.filterSchoolYear = +$event.itemData.id;
    this.payload = {
      schoolId: this.schoolInfo.id,
      schoolCode: this.schoolInfo.gdId,
      schoolYear: this.filterSchoolYear,
      token: this.user.data.gdToken
    }
    console.log(this.payload);
  }

  syncDuLieuDiemTieuHoc() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu đánh giá định kỳ không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncDuLieuHocBaDiemTieuHoc(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });

  }
  syncDuLieuGiaoVien() {
    let result = confirm(`Bạn có chắc muốn đồng bộ dữ liệu giáo viên không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncDuLieuHocBaGiaoVien(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });
  }

  syncDuLieuPCCMLop() {
    let result = confirm(`Bạn có chắc muốn xóa dữ liệu chữ ký và đồng bộ phân công chuyên môn lớp không`, 'Xác nhận đồng bộ');

    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        this.generalService.syncPhanCongGiaoVienLop(this.payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, `Có ${en.message} dữ liệu được đồng bộ thành công`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, "Đồng bộ dữ liệu thất bại");
          }
        }, error => {

        });
      }
    });
  }
}
