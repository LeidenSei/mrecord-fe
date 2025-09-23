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
import CustomStore from "devextreme/data/custom_store";
import {LoadOptions} from "devextreme/data";
import {lastValueFrom} from 'rxjs';

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

@Component({
  selector: 'app-teacher-course',
  templateUrl: './teacher-course.component.html',
  styleUrls: ['./teacher-course.component.scss']
})
export class TeacherCourseComponent implements OnInit {
  isShowEdit = false;
  getSizeQualifier = getSizeQualifier;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  dataSource: any;
  isShowUpdateClass = false;
  @ViewChild('khoaHocvalidationGroup', {static: true}) khoaHocvalidationGroup: DxValidationGroupComponent;

  @ViewChild("dropzone_external", {static: false}) dropZoneElement: ElementRef;
  @ViewChild("fileUploader", {static: false}) fileUploader: DxFileUploaderComponent;
  pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  loaiSachSource = [
    {
      value: 1,
      label: 'Cánh diều',
    },
    {
      value: 2,
      label: 'Chân trời sáng tạo',
    },
    {
      value: 3,
      label: 'Kết nối tri thức',
    },
    {
      value: 100,
      label: 'Khác',
    },
  ];
  gradeSource = [];
  subjectSource = [];
  editSubjectSource = [];
  teacherClassSource = [];
  filterTeacherClassSource = [];
  arrImg = [];
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  isShowUploadTaiLieu = false;
  user: any;
  subject: any;
  hasRoleTTCM = false;
  schoolClassSource = [];

  homeClass: any;
  selectedItems: any[] = [];

  changedClassesIds: any[] = [];
  filterSchoolYear: number;
  schoolYearSource: any[] = [];
  currentYear: number;
  showTrangThaiDuyet = false;
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
    this.formUpdateReset();
    this.subject = null;
    this.changedClassesIds = [];
    this.schoolYearSource = this.service.getYearSource();
  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    this.user = await this.authService.getUser();
    this.filterSchoolYear = this.user.data.currentYear;
    this.currentYear = this.user.data.currentYear;
    if (this.user.data.toTruongMon && this.user.data.toTruongMon.length) {
      this.hasRoleTTCM = true;
    }
    this.dataItem.accountId = this.user.data.id;
    this.dataItem.accountType = this.user.data.role;
    forkJoin([
      this.generalService.getSchool(this.user.data.schoolId),
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId),
      this.generalService.getListClassByTeacher(this.user.data.schoolId, this.user.data.personId),
      this.generalService.getListClassBySchool(this.user.data.schoolId),
      this.generalService.getListSubjectByTeacher(this.user.data.schoolId, this.user.data.personId)
    ]).subscribe(([school, gradeSource, subjectSource, teacherClassSource, schoolClassSource, teacherSubjectSource]) => {
      this.showTrangThaiDuyet  = school.lmsApproveLevel > 0;

      this.gradeSource = gradeSource;
      this.subjectSource = subjectSource;
      this.teacherClassSource = teacherClassSource;
      this.schoolClassSource = schoolClassSource;
      this.filterTeacherClassSource = teacherClassSource.filter(en => 1 === 1);
      if (this.user.data.isBGH) {
        this.editSubjectSource = subjectSource;
      } else if (this.user.data.toTruongMon && this.user.data.toTruongMon.length) {
        const lstByTTCM = subjectSource.filter(en => this.user.data.toTruongMon.includes(en.id));
        const mergedList = lstByTTCM.concat(teacherSubjectSource);
        this.editSubjectSource = mergedList.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );
      } else {
        if (teacherSubjectSource.length) {
          this.editSubjectSource = teacherSubjectSource;
        } else {
          this.editSubjectSource = subjectSource;
        }
      }

      this.loadGrid();
    });
  }

  async loadGrid() {
    const authService = this.authService;
    const generalService = this.generalService;
    const schoolClassSource = this.schoolClassSource;
    const filterSchoolYear = this.filterSchoolYear;
    /* const filterSubjectId = this.filterSubjectId;
     const filterClassIds = this.filterClassIds;*/
    this.dataSource = new CustomStore({
      async load(loadOptions: LoadOptions) {
        try {
          console.log(loadOptions);
          if (!loadOptions.take) {
            loadOptions.skip = 20;
            loadOptions.take = 20;
          }
          const user = await authService.getUser();
          let payload = {
            pageNumber: (loadOptions.skip / loadOptions.take) + 1,
            pageSize: loadOptions.take,
            schoolId: user.data.schoolId,
            teacherId: user.data.id,
            schoolYear: filterSchoolYear
          };
          if (!filterSchoolYear) {
            delete payload.schoolYear;
          }
          let result = await lastValueFrom(generalService.getTeacherCourse(payload));
          let index = 1;
          // @ts-ignore
          result.items.forEach(en => {
            en.stt = loadOptions.skip + index++;
            en.orderText = en.order > 0 ? ('' + en.order) : '',
            en.className = schoolClassSource.filter(cls => en.displaySettings.classIds.includes(cls.id)).map(en => en.name).join(', ');
          });
          return {
            // @ts-ignore
            data: result.items,
            // @ts-ignore
            totalCount: result.totalCount,
            /*summary: 10000,
            groupCount: 10,*/
          };
        } catch (err) {
          console.log(err);
        }
      }
    })
  }

  /*async loadGrid() {
    const user = await this.authService.getUser();
    console.log(user);
    let payload = {
      pageNumber: 1,
      pageSize: 1000
    };
    this.generalService.getTeacherCourse(payload).subscribe(res => {
      this.datas = res.items;
      let index = 1;
      this.datas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }*/

  isValid() {
    return this.khoaHocvalidationGroup.instance.validate().isValid;
  }

  async save() {

  }

  formUpdateReset() {
    this.dataItem = {
      anhDaiDien: '',
      accountId: '',
      accountType: 1,
      order: 0,
      displaySettings: {
        danhChoHocSinh: false,
        hocSinhTrongLop: false,
        hocSinhTrongTruong: false,
        danhChoGiaoVien: false,
        giaoVienTrongTruong: false,
        giaoVienTrongSo: false,
        riengTu: false,
        chiaSeHocLieuSoChung: false,
        chiaSeHocLieuSoPhongGD: false,
        nopBaiTapHuanHe: false,
        classIds: []
      }
    };
  }

  addItemClick() {
    this.isShowEdit = true;
    this.formUpdateReset();
    this.initUploadTrigger();
    this.khoaHocvalidationGroup.instance.reset();
  }

  private initUploadTrigger() {
    console.log(this.dropZoneElement);
    this.fileUploader.instance.option({
      dropZone: this.dropZoneElement.nativeElement,
      dialogTrigger: this.dropZoneElement.nativeElement
    });
  }

  onEditClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.editTitle = 'Sửa thông tin khóa học';
    //console.log(e.row.data);
    this.isShowEdit = true;
    this.initUploadTrigger();
    this.dataItem = Object.assign({}, e.row.data);
    //clear source
    this.filterTeacherClassSource = this.teacherClassSource.filter(en => 1 === 1);
    this.dataItem.displaySettings.classIds.forEach(classId => {
      const curClass = this.teacherClassSource.find(x => x.id === classId);
      if (!curClass) {
        const schClass = this.schoolClassSource.find(en => en.id === classId);
        if (schClass) {
          this.filterTeacherClassSource.push(schClass);
        }
      }
    });
    /*this.router.navigate(['/mvp/add', e.row.data.id]);
    e.event.preventDefault();*/
    //this.router.navigate([`/mvp/edit/${e.row.data.id}`]);
  };
  onBaiGiangView = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.router.navigate(['/teacher/teacher-course', e.row.data.id, e.row.data.name]);
  }

  taoBaiGiang(data: any) {
    console.log(data);
    this.router.navigate(['/teacher/lesson-editor/', data.id, 'new']);
  }


  async onSaveClick() {
    console.log(this.dataItem);
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

  saveAdd() {
    this.dataItem.accountId = this.user.data.id;
    this.dataItem.accountType = this.user.data.role;
    if (!this.dataItem.anhDaiDien) {
      let i = new Date().getMilliseconds() % 15;
      this.dataItem.anhDaiDien = this.arrImg[i];
    }
    if (!this.dataItem.displaySettings.danhChoHocSinh){
      this.dataItem.displaySettings.hocSinhTrongLop = false;
      this.dataItem.displaySettings.hocSinhTrongTruong = false;
      this.dataItem.displaySettings.classIds = [];
    }
    if (!this.dataItem.order)
      this.dataItem.order = 0;
    this.generalService.addKhoaHoc(this.dataItem).subscribe(res => {
      console.log(res);
      this.isShowEdit = false;
      this.notificationService.showNotification(Constant.SUCCESS, 'Thêm mới khóa học thành công');
      this.loadGrid();
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
    if (!this.dataItem.displaySettings.danhChoHocSinh){
      this.dataItem.displaySettings.hocSinhTrongLop = false;
      this.dataItem.displaySettings.hocSinhTrongTruong = false;
      this.dataItem.displaySettings.classIds = [];
    }
    if (!this.dataItem.order)
      this.dataItem.order = 0;
    this.generalService.updateKhoaHoc(this.dataItem).subscribe(res => {
      if (res) {
        this.isShowEdit = false;
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật khóa học thành công');
        this.loadGrid();
      }
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật khóa học thất bại: ' + error);
    });
  }

  closePopupEdit() {
    this.isShowEdit = false;
  }

  closePopupUpdateClass() {
    this.isShowUpdateClass = false;
  }

  /*handle upload*/
  onUploadStarted(e: any) {
    /*console.log('Upload started:', e);

    const item = e.file;
    const formData = new FormData();
    formData.append('formFile', item.file as any);

    this.generalService.upload(formData).subscribe(res => {
      console.log(formData);
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, error.message.toString());
    });

    // Thực hiện các hành động tùy chỉnh khi upload bắt đầu*/
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
    if (data.baiGiangIds.length || data.taiLieuIds.length) {
      this.notificationService.showNotification(Constant.WARNING, 'Không thể xóa khóa học đã có bài giảng hoặc tài liệu. Vui lòng xóa dữ liệu đó trước khi xóa khóa học');
      return;
    }
    const result = confirm(`Bạn có chắc chắn muốn xóa khóa học: <strong>${data.name}</strong> này?`, 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.deleteKhoaHoc(data.id).subscribe(en => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Xóa khóa học thành công');
          this.loadGrid();
        }, error => {

        });
      }
    });
  };

  changeRiengTu($event) {
    if ($event) {
      this.dataItem.displaySettings = {
        danhChoHocSinh: false,
        hocSinhTrongLop: false,
        hocSinhTrongTruong: false,
        danhChoGiaoVien: false,
        giaoVienTrongTruong: false,
        giaoVienTrongSo: false,
        riengTu: true,
        chiaSeHocLieuSoChung: false,
        chiaSeHocLieuSoPhongGD: false,
        nopBaiTapHuanHe: false,
        classIds: []
      }
    }
  }

  viewDsBaiGiang(id: string, name: string) {
    this.router.navigate(['/teacher/teacher-course', id, name]);
  }

  showUploadForm(data: any) {
    //to do
  }

  showPopupUpdateLessonClass(clsName = '') {
    this.filterTeacherClassSource = this.teacherClassSource.filter(en => 1 === 1);
    this.isShowUpdateClass = true;
  }

  handleSelectionChange(event: any) {
    this.selectedItems = event.selectedRowKeys;  // Cập nhật hàng được chọn tại client
    console.log('Selected items:', this.selectedItems);
  }

  onUpdateClassClick() {
    if (this.changedClassesIds.length) {
      const payload = {
        classIds: this.changedClassesIds,
        khoaHocIds: this.selectedItems.map(en => en.id)
      };
      console.log(payload);
      this.generalService.updateCourseClass(payload).subscribe(res => {
        this.isShowUpdateClass = false;
        if (res > 0) {
          this.notificationService.showNotification(Constant.SUCCESS, `Cập nhật khóa học thành công. Số khóa học được cập nhật: ${res} khóa học`);
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.WARNING, `Không có khóa học nào được cập nhật`);
        }
      }, error => {

      });
    }
  }

  schoolYearChange($event) {
    this.filterSchoolYear = +$event.itemData.id;
    this.loadGrid();
  }

  allowEdit() {
    return this.filterSchoolYear === this.currentYear || !this.filterSchoolYear;
  }

  getModeSelection() {
    if (this.filterSchoolYear === this.currentYear) return 'multiple';
    else return 'none';
  }
}
