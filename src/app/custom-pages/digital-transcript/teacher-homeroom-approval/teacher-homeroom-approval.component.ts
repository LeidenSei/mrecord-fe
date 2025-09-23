import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DxValidationGroupComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {confirm} from "devextreme/ui/dialog";
import {forkJoin} from 'rxjs';
import {ExportingEvent} from "devextreme/ui/data_grid";
import {Workbook} from "exceljs";
import {exportDataGrid as exportDataGridToXLSX} from "devextreme/excel_exporter";
import { saveAs } from 'file-saver-es';
import {FullNamePipe} from "../../../pipes/full-name.pipe";

@Component({
  selector: 'app-teacher-homeroom-approval',
  templateUrl: './teacher-homeroom-approval.component.html',
  styleUrls: ['./teacher-homeroom-approval.component.scss']
})
export class TeacherHomeroomApprovalComponent implements OnInit {
  isShowEdit = false;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  gradeSource = [];
  subjectSource = [];
  classSource = [];
  filterClassSource = [];
  arrImg = [];
  approveSource = [];
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  isShowUploadTaiLieu = false;
  subject: any;
  multiple = false;

  filterGrade: 0;
  filterStatus: -1;
  filterClassIds = [];
  schoolId: any;
  filterClassId: any;
  studentCount: 0;
  isAdmin = false;
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel', // Xuất tất cả dữ liệu
    exportSelectedRows: 'Export selected rows to Excel', // Xuất các dòng đã chọn
    exportTo: 'Export data', // Tiêu đề tổng
  };
  filterSchoolYear = 2024;
  schoolYearSource: any[] = [];
  pdfUrl: any = '';
  isShowPreview = false;
  isShowSignLoading = false;

  countdown: number = 100; // 1 phút 30 giây
  countdownDisplay: string = '01:40';
  private intervalId: any;
  selectedItems: any[] = [];
  isShowDiemDetail = false;
  isShowSignLoadingPrincipal = false;
  studentMarkTitle = 'Chi tiết điểm học sinh';
  schoolInfo: any;
  isElementary = true;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private fullNamePipe: FullNamePipe,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.dataItem = {
      imageUrls: [],
      files: []
    };
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    this.schoolYearSource = this.service.getYearSource();
  };

  ngAfterViewInit() {
    console.log('test webstorm 2025');
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.isAdmin = user.data.role === 2;
    this.schoolId = user.data.schoolId;
    //console.log(user);
    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListSubjectByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassBySchool(user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource, classSource, schoolClassSource]) => {
      this.subjectSource = subjectSource;
      this.classSource = (user.data.role === 2 || user.data.isBGH) ? schoolClassSource : classSource;
      let filterGradeIds = classSource.map(en => en.grade);
      //console.log(this.classSource, filterGradeIds);
      if (user.data.role === 2 || user.data.isBGH) {
        this.gradeSource = gradeSource.filter(en => 1 === 1);
      } else {
        this.gradeSource = gradeSource.filter(en => filterGradeIds.includes(en));
      }
      this.filterClassSource = this.classSource.filter(en => en.homeroomTeacher === user.data.personId || en.homeroomTeacher === user.data.id);
      this.filterClassId = this.filterClassSource[0].id;
      this.loadGrid();
      this.gradeSource.unshift('Tất cả');
    });
    this.generalService.getSchoolConfig(user.data.schoolId).subscribe((res: any) => {
      this.schoolInfo = res;
      this.isElementary = res.type === 1;

    }, error => {

    });
  }

  async loadGrid() {
    this.generalService.getNhanXetGVCN(this.schoolId, this.filterClassId, this.filterSchoolYear).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.studentCount = res.length;
      this.datas.forEach(en => {
        en.stt = index++;
        en.status = false;
        /*en.statusGVCN = en.status == 20 ? 'Đã ký' : 'Chưa ký';
        en.statusHieuTruong = en.status == 40 ? 'Đã ký' : 'Chưa ký';
        en.signedFileUrl = 'https://media.mschool.edu.vn/' + en.signedFileUrl;*/
      });
    }, error => {
    });
  }

  complineUrlSource(url) {
    if (url.indexOf('http') === -1) {
      url = this.configService.getConfig().api.mSchoolUrl + '' + url;
    }
    return url;
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  closePopupEdit() {
    this.isShowEdit = false;
  }

  gradeChange($event: any) {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = this.classSource.filter(en => 1 === 1);
    }
    this.filterClassId = this.filterClassSource[0].id;
  }

  classChange($event) {
    this.filterClassId = $event.itemData.id;
    this.loadGrid();
  }

  getPhoneStudent(data) {
    if (data.contacts) {
      let contact = data.contacts.find(en => en.mainContact);
      if (contact) return contact.value;
    }
    return '';
  }
  schoolYearChange($event) {
    this.filterSchoolYear = +$event.itemData.id;
    this.loadGrid();
  }

  onExporting(e: ExportingEvent) {
    /*const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');*/
    let cls = this.classSource.find(en => en.id === this.filterClassId);
    let clsName = cls.name.toUpperCase();
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('DsHocSinh');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `DS_HOCSINH_LOP_${clsName}.xlsx`);
      });
    });
    e.cancel = true;
  }
  changeUsingServiceLMS(data: any, $event) {
    let payload = {
      studentId: data.id,
      status: $event
    }
    this.generalService.updateStudentStatus(payload).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật trạng thái thành công');
      this.loadGrid();
    }, error => {

    });
  }
  changeUsingServiceMS(data: any, $event) {
    let payload = {
      studentId: data.id,
      status: $event
    }
    this.generalService.updateStudentStatusMS(payload).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật trạng thái thành công');
      this.loadGrid();
    }, error => {

    });
  }
  onCreate = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
  };

  doSign() {
    let result = confirm(`Bạn có chắc muốn ký số học bạ của học sinh ${this.dataItem.studentName} không`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.startCountdown();
        this.isShowSignLoading = true;
        this.generalService.signByGVCN(this.dataItem.id, this.isElementary).subscribe(en => {
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Ký số thành công');
            this.isShowPreview = false;
            this.isShowSignLoading = false;
            this.loadGrid();
            clearInterval(this.intervalId);
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Ký số không thành công. Kiểm tra lại thông tin ký số');
            clearInterval(this.intervalId);
            this.isShowSignLoading = false;
          }
        }, error => {

        });
      }
    });
  }
  startCountdown() {
    this.countdown = 100;
    this.updateDisplay();
    this.intervalId = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.updateDisplay();
      } else {
        clearInterval(this.intervalId);
        // TODO: gọi hàm xử lý hết giờ nếu cần
        this.isShowSignLoading = false;
      }
    }, 1000);
  }

  updateDisplay() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.countdownDisplay = `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  handleCloseLoading() {
    clearInterval(this.intervalId);
    this.isShowSignLoading = false;
  }

  handleSelectionChange($event) {
    this.selectedItems = $event.selectedRowKeys.map(en => ({
      id: en.iD_HOC_SINH,
      nhanxet: en.nhaN_XET_GVCN
    }));  // Cập nhật hàng được chọn tại client
    console.log('Selected items:', this.selectedItems);
  }

  doSaveReview() {
    let result = confirm(`Bạn có chắc muốn lưu nhận xét của  ${this.selectedItems.length} học sinh không`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;

        let payload = {ids: this.selectedItems.map(en => en.id), nhanxet: this.selectedItems.map(en => en.nhanxet), SchoolYear: this.filterSchoolYear};
        this.generalService.saveNhanXetGVCN(payload).subscribe(en => {
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Lưu nhận xét thành công');
            this.isShowSignLoadingPrincipal = false;
            this.loadGrid();
          } else {
            //this.notificationService.showNotification(Constant.ERROR, 'Ký số không thành công. Kiểm tra lại thông tin ký số');
          }
        }, error => {

        });


        /*setTimeout(() => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Lưu nhận xét thành công');
          this.isShowSignLoadingPrincipal = false;
        }, 1000);*/
      }
    });


  }

  onSign = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);


    let result = confirm(`Bạn có chắc muốn ký xác nhận GVCN môn học không?`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;
        setTimeout(() => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Ký xác nhận thành công');
          this.isShowSignLoadingPrincipal = false;
          e.row.data.status = true;
        }, 1000);
      }
    });

  };
  onViewDetail = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.isShowDiemDetail = true;
    this.dataItem = Object.assign({}, e.row.data);
    console.log(this.dataItem);
    this.studentMarkTitle = `Chi tiết điểm học sinh ${ this.dataItem.fullName}`;
  };
}
