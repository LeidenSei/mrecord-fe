import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from '../../../services';
import {GeneralService} from '../../../services/general.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationService} from '../../../services/notification.service';
import {DxDataGridComponent, DxDataGridTypes} from 'devextreme-angular/ui/data-grid';
import {DxFileUploaderComponent, DxValidationGroupComponent} from 'devextreme-angular';
import {Constant} from '../../../shared/constants/constant.class';
import {forkJoin} from 'rxjs';
import form from 'devextreme/ui/form';
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {AppConfigService} from '../../../app-config.service';
import {confirm} from 'devextreme/ui/dialog';
import DevExpress from 'devextreme';
import {custom} from 'devextreme/ui/dialog'
import CustomStore from 'devextreme/data/custom_store';
import {lastValueFrom} from 'rxjs';

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}


@Component({
  selector: 'app-approval-course',
  templateUrl: './approval-course.component.html',
  styleUrls: ['./approval-course.component.scss']
})
export class ApprovalCourseComponent implements OnInit {
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
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
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

  };


  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.schoolYearSource = this.service.getYearSource();
    this.filterSchoolYear = user.data.currentYear;
    console.log(user);
    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListSubjectBySchool(user.data.schoolId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId)
    ]).subscribe(([gradeSource, subjectSource, classSource]) => {
      this.gradeSource = gradeSource;
      this.subjectSource = subjectSource;
      this.classSource = classSource;
      //get môn học là tổ trưởng TCM
      if (user.data.isBGH) {
        this.filterSubjectSource = subjectSource;
        this.filterSubjectSource.unshift({id: '', name: 'Tất cả'});
        this.filterSubjectId = '';
        this.multipleApproved = true;
      } else {
        if (user.data.toTruongMon && user.data.toTruongMon.length) {
          this.isTTCM = true;
          this.subject = subjectSource.find(en => en.id === user.data.toTruongMon[0]);
          this.filterSubjectSource = subjectSource.filter(en => user.data.toTruongMon.includes(en.id));
          this.filterSubjectId = this.subject.id;
          //this.filterSubjectSource.unshift({id: '', name: 'Tất cả'});
        }
        if (user.data.toTruongMonKhoi && user.data.toTruongMonKhoi.length) {
          const ttcmGrades = user.data.toTruongMonKhoi.map(en => en.grade);
          const ttcmSubjectIds = user.data.toTruongMonKhoi.map(en => en.subjectId);
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
          let result = await lastValueFrom(generalService.getKhoaHocCanDuyet(payload));
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

  onApproveClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.isShowEdit = true;
    this.dataItem = Object.assign({}, e.row.data);

    this.generalService.approveKhoaHoc(this.dataItem.id).subscribe(res => {
      if (res.code !== 0) {
        this.notificationService.showNotification(Constant.ERROR, res.message);
      } else {
        this.bindGrid();
        this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt khóa học thành công');
      }
    }, error => {
    });
  };
  onBaiGiangDuyet = (data: any) => {
    this.router.navigate(['/teacher/approval-course', data.id, data.name]);
  }

  taoBaiGiang(data: any) {
    console.log(data);
    this.router.navigate(['/teacher/lesson-editor/', data.id, 'new']);
  }

  async onSaveClick() {
    if (this.isValid()) {
      if (this.dataItem.id) {
        this.saveUpdate();
      } else {
        this.saveAdd();
      }
    } else {
      this.notificationService.showNotification(Constant.ERROR, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }

  isValid() {
    return true;
  }

  saveAdd() {
    console.log(this.dataItem.anhDaiDien);
    if (!this.dataItem.anhDaiDien) {
      let i = new Date().getMilliseconds() % 15;
      this.dataItem.anhDaiDien = this.arrImg[i];
    }
    this.generalService.addKhoaHoc(this.dataItem).subscribe(res => {
      console.log(res);
      this.isShowEdit = false;
      this.notificationService.showNotification(Constant.SUCCESS, 'Thêm mới khóa học thành công');
      this.bindGrid();
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Thêm mới khóa học thất bại: ' + error);
    });
  }

  saveUpdate() {
    if (!this.dataItem.anhDaiDien) {
      let i = new Date().getMilliseconds() % 15;
      this.dataItem.anhDaiDien = this.arrImg[i];
    }
    console.log(this.dataItem);
    this.generalService.updateKhoaHoc(this.dataItem).subscribe(res => {
      if (res) {
        this.isShowEdit = false;
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật khóa học thành công');
        this.bindGrid();
      }
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật khóa học thất bại: ' + error);
    });
  }

  closePopupEdit() {
    this.isShowEdit = false;
  }

  /*handle upload*/
  onUploadStarted(e: any) {

  }

  onUploaded(e: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      console.log('Upload completed:', res);
      this.dataItem.anhDaiDien = res.url;
    }
    // Thực hiện các hành động tùy chỉnh khi upload hoàn tất
  }

  onUploadError(e: any) {
    console.error('Upload error:', e);
    // Thực hiện các hành động tùy chỉnh khi upload gặp lỗi
  }

  toDisplaySettingMessage() {

    if (!this.dataItem.displaySettings.danhChoHocSinh && !this.dataItem.displaySettings.danhChoGiaoVien && !this.dataItem.displaySettings.riengTu) {
      return 'Ít nhất một trong các lựa chọn Dành cho học sinh, Dành cho giáo viên, Riêng tư phải được chọn';
    }
    if (this.dataItem.displaySettings.danhChoGiaoVien && !this.dataItem.displaySettings.giaoVienTrongTruong && !this.dataItem.displaySettings.giaoVienTrongSo) {
      return 'Chọn trường đang dạy hoặc cộng đồng GV TPHCM';
    }
    if (this.dataItem.displaySettings.danhChoHocSinh && !this.dataItem.displaySettings.hocSinhTrongLop && !this.dataItem.displaySettings.hocSinhTrongTruong) {
      return 'Chọn học sinh trong lớp hoặc trường đang giảng dạy';
    }
    if (this.dataItem.displaySettings.danhChoHocSinh && this.dataItem.displaySettings.hocSinhTrongLop && !this.dataItem.displaySettings.classIds.length) {
      return 'Chọn ít nhất một lớp học';
    }
    return '';
  }

  onDeleteClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    let data = e.row.data;
    const result = confirm(`Bạn có chắc chắn muốn xóa hóa học: <strong>${data.name}</strong> này?`, 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.deleteKhoaHoc(data.id).subscribe(en => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Xóa khóa học thành công');
          this.bindGrid();
        }, error => {

        });
      }
    });
  };

  viewDsBaiGiang(id: string, name: string) {
    this.router.navigate(['/teacher/approval-course', id, name]);
  }

  showUploadForm(data: any) {

  }

  doApproveMutiple() {
    console.log(this.selectedItems);
    let ids = this.selectedItems.map(en => en.id);

    let khoaHocChoDuyets = this.selectedItems.filter(en => en.trangThai === 0);

    let messageHtml = `<p style="font-size: 15px">Bạn có chắc chắn muốn duyệt ${ids.length} khóa học này không?</p>`;
    if (khoaHocChoDuyets.length) {
      messageHtml = `<p style="font-size: 15px">Có ${khoaHocChoDuyets.length} khóa học chưa được TCM duyệt. Bạn có chắc chắn muốn duyệt không?</p>`;
    }
    const dialog = custom({
      title: 'Xác nhận',
      messageHtml,
      buttons: [
        {
          text: 'Đồng ý duyệt',
          type: 'success',
          stylingMode: 'outlined',
          onClick: () => {
            this.generalService.bghDuyetKhoaHocAll({khoaHocIds: ids}).subscribe(res => {
              if (res.code === 0) {
                this.notificationService.showNotification(Constant.SUCCESS, 'Duyệt khóa học thành công');
                this.bindGrid();
              } else {
                this.notificationService.showNotification(Constant.ERROR, res.message);
              }
            }, error => {
            });
            return {dialogResult: 'save'};  // Trả về đối tượng chứa giá trị dialogResult
          }
        },
        {
          text: 'Bỏ qua',
          stylingMode: 'outlined',
          onClick: () => {
            return {dialogResult: 'cancel'};  // Tương tự cho cancel
          }
        },
      ],
    });
    dialog.show();
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
}
