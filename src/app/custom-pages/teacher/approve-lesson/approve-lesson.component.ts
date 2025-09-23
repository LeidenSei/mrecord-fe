import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DxFileUploaderComponent, DxValidationGroupComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {confirm} from "devextreme/ui/dialog";
import {DxButtonTypes} from "devextreme-angular/ui/button";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-approve-lesson',
  templateUrl: './approve-lesson.component.html',
  styleUrls: ['./approve-lesson.component.scss']
})
export class ApproveLessonComponent implements OnInit {
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  datas = [];
  courseTitle = '';
  courseId: any;
  isShowUploadTaiLieu = false;
  uploadHeaders: any;
  user: any;
  isEdit = true;
  isShowApproveBaiGiangMode = false;
  isShowApproveTaiLieuMode = false;
  baiGiangItem: any;
  taiLieuItem: any;
  khoaHocItem: any;
  lessonId: any;
  taiLieuId: any;
  h5pFrame: any;
  iframeHeight = 1000;
  isShowFormNote = false;
  isShowComment = false;
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  taiLieuUrl: any;
  taiLieuSafeUrl: any;
  frameId = 'h5pFrame';
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;


  private messageHandler: any;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private location: Location,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private sanitizer: DomSanitizer,
              private ref: ChangeDetectorRef) {
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.baiGiangItem = {};
    this.taiLieuItem = {};
  }

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    this.messageHandler = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageHandler, false);

    let courseTitle = this.route.snapshot.paramMap.get('courseTitle');
    if (courseTitle) {
      this.courseTitle = courseTitle;
    }
    this.user = await this.authService.getUser();
    this.courseId = this.route.snapshot.paramMap.get('courseId');

    this.loadGrid();
    this.loadCourse();
  }

  removeMessageListener() {
    window.removeEventListener('message', this.messageHandler, false);
  }

  receiveMessage(event: any) {
    if (!this.h5pFrame || !this.h5pFrame.contentWindow) {
      this.removeMessageListener();
      return;
    }
    if (event.origin !== this.h5pUrl) {
      return;
    }
    if (event.data.type === 'callParentFunction' && event.data.payload) {
      this.callParentFunction(event.data.payload);
    }
  }

  loadCourse() {
    this.generalService.getKhoaHoc(this.courseId).subscribe(res => {
      console.log(this.courseId, res);
      this.khoaHocItem = res;
    }, error => {
    });
  }

  async loadGrid() {
    const user = await this.authService.getUser();
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.generalService.getListHocLieuForApprove(this.courseId).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.datas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }

  approveAllClick() {
    const result = confirm(`Bạn có chắc chắn muốn duyệt tất cả học liệu không`, 'Xác nhận duyệt');
    result.then((dialogResult) => {
      if (dialogResult) {
        if (this.user.data.isBGH) {
          this.generalService.bghDuyetKhoaHoc(this.courseId).subscribe(res => {
            if (res.code === 0) {
              this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt khóa học thành công');
              this.loadGrid();
            } else {
              this.notificationService.showNotification(Constant.ERROR, res.message);
            }
          }, error => {
          });
        } else {
          this.generalService.tcmDuyetKhoaHoc(this.courseId).subscribe(res => {
            if (res.code === 0) {
              this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt khóa học thành công');
              this.loadGrid();
            } else {
              this.notificationService.showNotification(Constant.ERROR, res.message);
            }
          }, error => {
          });
        }
      }
    });
  }

  backToMyCouse() {
    //this.location.back();
    this.router.navigate(['/teacher/approval-course']);
  }

  viewDetail(data: any) {
    if (data.loaiHocLieu === 2) {
      this.router.navigate(['/teacher/lesson-player', this.courseId, data.id, 2]);
    } else {
      this.router.navigate(['/teacher/lesson-player', this.courseId, data.id, 1]);
    }
  }

  showPopupDuyet(data: any) {
    if (data.loaiHocLieu === 2) {
      this.isShowApproveBaiGiangMode = true;
      this.isShowFormNote = false;
      this.lessonId = data.id;
      setTimeout(() => {
        this.h5pFrame = document.getElementById('h5pFrame');
        if (this.h5pFrame) {
          this.h5pFrame.setAttribute("src", this.h5pUrl);
        }
      }, 10);
    } else {
      this.isShowApproveTaiLieuMode = true;
      this.isShowFormNote = false;
      this.taiLieuId = data.id;
      this.loadTaiLieu(data.id);
    }
  }

  playContent(contentId) {
    console.log('playerContent');
    if (this.h5pFrame && this.h5pFrame.contentWindow) {
      this.h5pFrame.contentWindow.postMessage({
        type: 'playContentId', contentId,
      }, '*');
    }
  }

  callParentFunction(payload) {
    //console.log('callParentFunction', payload);
    if (payload.loaded) {
      this.loginH5P();
    }
    if (payload.contentHeight) {
      this.iframeHeight = payload.contentHeight + 150;
    }
    if (payload.key === 'csrfTokenPlayer') {
      let lessonId = this.lessonId;
      if (lessonId) {
        this.loadLesson(lessonId);
      }
    }
  }

  async loginH5P() {
    const user = await this.authService.getUser();
    setTimeout(() => {
      if (this.h5pFrame && this.h5pFrame.contentWindow) {
        this.h5pFrame.contentWindow.postMessage({
          type: 'doLoginPlayer', userId: user.data.id
        }, '*');
      } else {
      }
    }, 0);
  }

  loadLesson(lessonId) {
    this.generalService.getBaiGiang(lessonId).subscribe(res => {
      if (res) {
        this.baiGiangItem = res;
        setTimeout(() => {
          this.playContent(this.baiGiangItem.code);
        }, 0);

        if (this.baiGiangItem.trangThaiDuyet === 5) {
          this.isShowFormNote = true;
        }

      } else {
      }
    }, error => {
    });
  }

  loadTaiLieu(taiLieuId) {
    this.generalService.getTaiLieu(taiLieuId).subscribe(res => {
      if (res) {
        this.taiLieuItem = res;
        this.taiLieuUrl = res.url;
        this.taiLieuSafeUrl = this.toSafeUrl();
        if (this.taiLieuItem.trangThaiDuyet === 5) {
          this.isShowFormNote = true;
        }
      } else {
      }
    }, error => {
    });
  }

  doApprovedBaiGiang() {
    if (this.user.data.isBGH) {
      this.generalService.bghDuyetBaiGiang(this.baiGiangItem.id).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt bài giảng thành công');
          this.isShowApproveBaiGiangMode = false;
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    } else {
      this.generalService.tcmDuyetBaiGiang(this.baiGiangItem.id).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt bài giảng thành công');
          this.isShowApproveBaiGiangMode = false;
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    }
  }

  showFormNote() {
    this.isShowFormNote = true;

  }

  tuChoiDuyetBaiGiang() {
    if (this.user.data.isBGH) {
      if (!this.baiGiangItem.yeuCauChinhSua) {
        this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập nội dung đề nghị trước khi gửi');
        return;
      }
      let payload = {
        baiGiangId: this.baiGiangItem.id,
        ghiChu: this.baiGiangItem.yeuCauChinhSua
      };
      this.generalService.bghTuChoiBaiGiang(payload).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Đề nghị chỉnh sửa thành công');
          this.isShowApproveBaiGiangMode = false;
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    } else {
      if (!this.baiGiangItem.yeuCauChinhSua) {
        this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập nội dung đề nghị trước khi gửi');
        return;
      }
      let payload = {
        baiGiangId: this.baiGiangItem.id,
        ghiChu: this.baiGiangItem.yeuCauChinhSua
      };
      this.generalService.tcmTuChoiBaiGiang(payload).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Đề nghị chỉnh sửa thành công');
          this.isShowApproveBaiGiangMode = false;
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    }
  }
  tuChoiDuyetTaiLieu() {
    if (this.user.data.isBGH) {
      if (!this.taiLieuItem.yeuCauChinhSua) {
        this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập nội dung đề nghị trước khi gửi');
        return;
      }
      let payload = {
        taiLieuId: this.taiLieuItem.id,
        ghiChu: this.taiLieuItem.yeuCauChinhSua
      };
      this.generalService.bghTuChoiTaiLieu(payload).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Đề nghị chỉnh sửa thành công');
          this.isShowApproveTaiLieuMode = false;
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    } else {
      if (!this.taiLieuItem.yeuCauChinhSua) {
        this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập nội dung đề nghị trước khi gửi');
        return;
      }
      let payload = {
        taiLieuId: this.taiLieuItem.id,
        ghiChu: this.taiLieuItem.yeuCauChinhSua
      };
      this.generalService.tcmTuChoiTaiLieu(payload).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Đề nghị chỉnh sửa thành công');
          this.isShowApproveTaiLieuMode = false;
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    }
  }
  doApprovedTaiLieu(){
    if (this.user.data.isBGH) {
      this.generalService.bghDuyetTaiLieu(this.taiLieuItem.id).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt bài giảng thành công');
          this.isShowApproveTaiLieuMode = false;
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    } else {
      this.generalService.tcmDuyetTaiLieu(this.taiLieuItem.id).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt bài giảng thành công');
          this.isShowApproveTaiLieuMode = false;
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    }
  }
  viewNote(data: any) {
    this.baiGiangItem = data;
    this.isShowComment = true;
  }

  checkButtonApproveBaiGiang() {
    if (!this.user) return false;
    if (!this.user.data.isBGH) {
      return this.baiGiangItem.trangThaiDuyet <= 10
    } else {
      return true;
    }
    return false;
  }
  checkButtonApproveTaiLieu() {
    if (!this.user) return false;
    if (!this.user.data.isBGH) {
      return this.taiLieuItem.trangThaiDuyet <= 10
    } else {
      return true;
    }
    return false;
  }
  checkButtonApproveAll() {
    if (!this.khoaHocItem) return false;
    if (!this.user.data.isBGH) {
      return this.khoaHocItem.trangThai == 0
    } else {
      return this.khoaHocItem.trangThai != 20
    }
    return false;
  }
  typeOfMedia(path) {
    return this.service.typeOfMedia(path);
  }
  toSafeUrl(){
    let url = `https://view.officeapps.live.com/op/embed.aspx?src=${this.taiLieuUrl}`
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
