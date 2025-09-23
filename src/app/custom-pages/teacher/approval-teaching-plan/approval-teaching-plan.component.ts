import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DxDataGridComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import CustomStore from "devextreme/data/custom_store";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {confirm, custom} from "devextreme/ui/dialog";
import {forkJoin} from 'rxjs';
import {lastValueFrom} from 'rxjs';
import {DomSanitizer} from "@angular/platform-browser";
export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}
@Component({
  selector: 'app-approval-teaching-plan',
  templateUrl: './approval-teaching-plan.component.html',
  styleUrls: ['./approval-teaching-plan.component.scss']
})
export class ApprovalTeachingPlanComponent implements OnInit {
  @ViewChild(DxDataGridComponent, {static: true}) dataGrid: DxDataGridComponent;
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
  filterSubjectId: any;
  filterStatus: -1;
  filterSubjectSource = [];
  dataSource: any;
  isTTCM = false;
  readonly allowedPageSizes = this.service.getAllowPageSizes();
  schoolYearSource: any[] = [];
  filterSchoolYear: number;
  selectedItems: any[] = [];

  //dataSource: AspNetData.CustomStore;
  //Duyet
  user: any;
  isShowApproveTaiLieuMode = false;
  isShowFormNote = false;
  isShowComment = false;
  taiLieuUrl: any = '';
  taiLieuId: any;
  taiLieuSafeUrl: any;
  zoomLevel: number = 1;
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private sanitizer: DomSanitizer,
              private ref: ChangeDetectorRef) {

    this.editTitle = 'Thêm mới khóa học';
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    for (let i = 1; i <= 15; i++) {
      this.arrImg.push(`https://mschool.edu.vn/media/lms/${i}.png`);
    }
    this.approveSource = [
      {status: -1, name: 'Tất cả'},
      {status: 0, name: 'Chờ duyệt'},
      {status: 5, name: 'Tổ chuyên môn đề nghị sửa'},
      {status: 10, name: 'TCM duyệt'},
      {status: 15, name: 'BGH từ chối'},
      {status: 20, name: 'BGH duyệt'}
    ];
    const isNotEmpty = (value: unknown) => (value !== undefined && value !== null && value !== '');
    this.taiLieuItem = {};
  };

  zoomIn() {
    this.zoomLevel += 0.1; // Tăng mức zoom lên 20%
  }

  zoomOut() {
    this.zoomLevel -= 0.1; // Giảm mức zoom đi 20%
  }
  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    this.user = await this.authService.getUser();
    this.schoolYearSource = this.service.getYearSource();
    this.filterSchoolYear = this.user.data.currentYear;
    console.log(this.user);
    forkJoin([
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId),
      this.generalService.getListClassByTeacher(this.user.data.schoolId, this.user.data.personId)
    ]).subscribe(([gradeSource, subjectSource, classSource]) => {
      this.gradeSource = gradeSource;
      this.subjectSource = subjectSource;
      this.classSource = classSource;
      //get môn học là tổ trưởng TCM
      if (this.user.data.isBGH) {
        this.filterSubjectSource = subjectSource;
        this.filterSubjectSource.unshift({id: '', name: 'Tất cả'});
        this.filterSubjectId = '';
        this.multipleApproved = true;
      } else {
        if (this.user.data.toTruongMon && this.user.data.toTruongMon.length) {
          this.isTTCM = true;
          this.subject = subjectSource.find(en => en.id === this.user.data.toTruongMon[0]);
          this.filterSubjectSource = subjectSource.filter(en => this.user.data.toTruongMon.includes(en.id));
          this.filterSubjectId = this.subject.id;
          //this.filterSubjectSource.unshift({id: '', name: 'Tất cả'});
        }
        if (this.user.data.toTruongMonKhoi && this.user.data.toTruongMonKhoi.length) {
          const ttcmGrades = this.user.data.toTruongMonKhoi.map(en => en.grade);
          const ttcmSubjectIds = this.user.data.toTruongMonKhoi.map(en => en.subjectId);
          if (!this.isTTCM) {
            this.gradeSource = gradeSource.filter(en => ttcmGrades.includes(en));
            this.filterSubjectSource = subjectSource.filter(en => ttcmSubjectIds.includes(en.id));
          } else {
            const subjectTruongMonKhois = subjectSource.filter(en => ttcmSubjectIds.includes(en.id))
            this.filterSubjectSource = this.filterSubjectSource.concat(subjectTruongMonKhois);
          }
          this.subject = subjectSource.find(en => ttcmSubjectIds.includes(en.id));
          this.filterSubjectSource.unshift({id: '', name: 'Tất cả'});
          //this.filterSubjectId = this.subject.id;
          this.filterSubjectId = '';
        }
      }

      this.gradeSource.unshift('Tất cả');
      this.bindGrid();
      //this.loadGrid();
    });
  }

  schoolYearChange($event) {
    this.filterSchoolYear = +$event.itemData.id;
    this.bindGrid();
  }

  async bindGrid() {
    const authService = this.authService;
    const generalService = this.generalService;
    let filterSubjectId = this.filterSubjectId;
    let filterStatus = this.filterStatus;
    let filterGrade = this.filterGrade;
    let filterSchoolYear = this.filterSchoolYear;
    this.dataSource = new CustomStore({
      async load(loadOptions: any) {
        //console.log('loadOptions', loadOptions);
        try {
          const user = await authService.getUser();
          let subjectId = filterSubjectId;
          //console.log(subjectId)
          let payload = {
            pageNumber: (loadOptions.skip / loadOptions.take) + 1,
            pageSize: loadOptions.take,
            schoolId: user.data.schoolId,
            schoolYear: filterSchoolYear,
            subjectId: subjectId,
            grade: 0,
            trangThai: -1
          };
          if (filterGrade > 0)
            payload.grade = filterGrade;
          else
            delete payload.grade;

          if (filterStatus > -1)
            payload.trangThai = filterStatus;
          else
            delete payload.trangThai;

          if (!subjectId || subjectId === '0')
            delete payload.subjectId;
          console.log('payload', payload);
          let result = await lastValueFrom(generalService.getGiaoAnCanDuyet(payload));
          let index = 1;
          // @ts-ignore
          result.items.forEach(en => {
            en.stt = loadOptions.skip + index++;
          });

          return {
            // @ts-ignore
            data: result.items,
            // @ts-ignore
            totalCount: result.totalCount,
            summary: 10000,
            groupCount: 10,
          };
        } catch (err) {
          console.log(err);
        }
      }
    })
  }

  addItemClick() {
    this.isShowEdit = true;
  }

  showPopupDuyet(data: any) {
    this.isShowApproveTaiLieuMode = true;
    this.isShowFormNote = false;
    this.taiLieuId = data.id;
    this.loadTaiLieu(data.id);
  }

  loadTaiLieu(taiLieuId) {
    this.generalService.getGiaoAn(taiLieuId).subscribe(res => {
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
  toSafeUrl(){
    let url = `https://view.officeapps.live.com/op/embed.aspx?src=${this.taiLieuUrl}`
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isValid() {
    return true;
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

  closePopupEdit() {
    this.isShowEdit = false;
  }

  viewDsBaiGiang(id: string, name: string) {
    this.router.navigate(['/teacher/approval-course', id, name]);
  }

  showUploadForm(data: any) {

  }

  statusChange($event: any) {
    console.log($event);
    this.filterStatus = $event.itemData.status;
    this.bindGrid();
  }

  gradeChange($event: any) {
    console.log($event);
    this.filterGrade = $event.itemData;
    this.bindGrid();
  }

  subjectChange($event: any) {
    console.log($event);
    this.filterSubjectId = $event.itemData.id;

    this.subject = this.subjectSource.find(en => en.id === this.filterSubjectId);
    this.bindGrid();
  }

  handleSelectionChange(event: any) {
    this.selectedItems = event.selectedRowKeys;  // Cập nhật hàng được chọn tại client
    console.log('Selected items:', this.selectedItems);
  }

  doApprovedTaiLieu(){
    if (this.user.data.isBGH) {
      this.generalService.bghDuyetGiaoAn(this.taiLieuItem.id).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt bài giảng thành công');
          this.isShowApproveTaiLieuMode = false;
          this.bindGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    } else {
      this.generalService.tcmDuyetGiaoAn(this.taiLieuItem.id).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt bài giảng thành công');
          this.isShowApproveTaiLieuMode = false;
          this.bindGrid();
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
      this.generalService.bghTuChoiGiaoAn(payload).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Đề nghị chỉnh sửa thành công');
          this.isShowApproveTaiLieuMode = false;
          this.bindGrid();
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
      this.generalService.tcmTuChoiGiaoAn(payload).subscribe(res => {
        if (res.code === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Đề nghị chỉnh sửa thành công');
          this.isShowApproveTaiLieuMode = false;
          this.bindGrid();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
        }
      }, error => {
      });
    }
  }
  viewNote(data: any) {
    this.taiLieuItem = data;
    this.isShowComment = true;
  }
  showFormNote() {
    this.isShowFormNote = true;
  }
  typeOfMedia(path) {
    return this.service.typeOfMedia(path);
  }
}
