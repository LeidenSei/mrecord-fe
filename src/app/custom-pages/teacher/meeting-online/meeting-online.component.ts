import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {DxFileUploaderComponent, DxValidationGroupComponent} from "devextreme-angular";
import {Constant} from "../../../shared/constants/constant.class";
import {forkJoin} from 'rxjs';
import form from "devextreme/ui/form";
import {HttpHeaders} from "@angular/common/http";
import {AppConfigService} from "../../../app-config.service";
import {confirm} from "devextreme/ui/dialog";
import DevExpress from "devextreme";
import custom = DevExpress.ui.dialog.custom;
import {H5pAuthenService} from "../../../services/h5p-authen-service";
import {H5pContentService} from "../../../services/h5p-content.service";

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

@Component({
  selector: 'app-meeting-online',
  templateUrl: './meeting-online.component.html',
  styleUrls: ['./meeting-online.component.scss']
})
export class MeetingOnlineComponent implements OnInit {
  isShowEdit = false;
  getSizeQualifier = getSizeQualifier;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  gradeSource = [];
  subjectSource = [];
  classSource = [];
  arrImg = [];
  approveSource = [];
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  isShowUploadTaiLieu = false;
  subject: any;
  multipleApproved = false;

  filterGrade: 0;
  filterStatus: -1;
  filterClassIds = [];
  user: any;
  csfToken: any;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  constructor(private service: DataService,
              private h5pService: H5pAuthenService,
              private h5pContentService: H5pContentService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.dataItem = {};
    this.editTitle = 'Thêm mới phòng họp trực tuyến';
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    for (let i = 1; i <= 15; i++) {
      this.arrImg.push(`https://mschool.edu.vn/media/lms/${i}.png`);
    }

  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    this.user = await this.authService.getUser()

    forkJoin([
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectByTeacher(this.user.data.schoolId, this.user.data.personId),
      this.generalService.getListClassByTeacher(this.user.data.schoolId, this.user.data.personId),
      this.generalService.getListClassBySchool(this.user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource, classSource, schoolClassSource]) => {
      this.gradeSource = gradeSource;
      this.subjectSource = subjectSource;
      this.classSource = this.user.data.role === 2 ? schoolClassSource : classSource;
      this.loadGrid();
      //this.onLogin();
    });
  }

  onLogin() {
    this.h5pService.login('teacher69661d512de8491e62fb4e3c1a6', 'admin').subscribe(
      (response) => {
        console.log('Logged in successfully', response);
        this.csfToken = response.csrfToken;
        // Thêm logic để lưu trữ token, chuyển trang, v.v.
        this.h5pContentService.list().subscribe(en => {
          console.log(en);
        });
      },
      (error) => {
        console.error('Login failed', error);
      }
    );
  }

  async loadGrid() {
    const user = await this.authService.getUser();
    let payload = {
      schoolId: user.data.schoolId,
      accountId: user.data.id,
      "take": 200,
      "skip": 0,
      "pageNumber": 1,
      "pageSize": 200
    };
    if (user.data.role === 2) {
      delete payload.accountId;
    }
    /*if (this.filterGrade > 0)
      payload.grade = this.filterGrade;
    else
      delete payload.grade;

    if (this.filterStatus > -1)
      payload.trangThai = this.filterStatus
    else
      delete payload.trangThai;*/

    this.generalService.getListPhongHop(payload).subscribe(res => {
      this.datas = res.items;
      let index = 1;
      this.datas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }

  addItemClick() {
    this.isShowEdit = true;
    this.formUpdateReset();
  }

  formUpdateReset() {
    this.dataItem = {
      accountId: this.user.data.id,
      accountType: this.user.data.role,
      schoolId: this.user.data.schoolId
    };
  }

  onEditClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    this.isShowEdit = true;
  };

  complineUrlSource(url) {
    if (url.indexOf('http') === -1) {
      url = this.configService.getConfig().api.mSchoolUrl + '' + url;
    }
    return url;
  }

  async onSaveClick() {
    if (this.isValid()) {
      if (this.dataItem.id) {
        this.saveUpdate();
      } else {
        this.saveAdd();
      }
    } else {
      this.notificationService.showNotification(Constant.WARNING, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  saveAdd() {
    this.generalService.addPhongHop(this.dataItem).subscribe(res => {
      this.isShowEdit = false;
      this.notificationService.showNotification(Constant.SUCCESS, 'Thêm mới thành công');
      this.loadGrid();
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
    });
  }

  saveUpdate() {
    this.generalService.updatePhong(this.dataItem).subscribe(res => {
      this.isShowEdit = false;
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật thành công');
      this.loadGrid();
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
    });
  }

  closePopupEdit() {
    this.isShowEdit = false;
  }

  onDeleteClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    let data = e.row.data;
    const result = confirm(`Bạn có chắc chắn muốn xóa phòng <strong>${data.title}</strong> này?`, 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.deletePhongHop(data.id).subscribe(en => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Xóa dữ liệu thành công');
          this.loadGrid();
        }, error => {

        });
      }
    });
  };

  viewDsBaiGiang(id: string, name: string) {
    //this.router.navigate(['/teacher/teacher-course', id, name]);
  }

  showUploadForm(data: any) {

  }

  doApproveMutiple() {

  }

  statusChange($event: any) {
    /* console.log($event);
     this.filterStatus = $event.itemData.status;
     this.loadGrid();*/
  }

  gradeChange($event: any) {
    /*console.log($event);
    this.filterGrade = $event.itemData;
    this.loadGrid();*/
  }

  deleteImage(url: any) {
    this.dataItem.imageUrls = this.dataItem.imageUrls.filter(en => en !== url);
  }

  deleteFile(item: any) {
    this.dataItem.files = this.dataItem.files.filter(en => en.filename !== item.filename);
  }

  doFilterClass($event) {
    console.log($event);
    this.loadGrid();
  }
}
