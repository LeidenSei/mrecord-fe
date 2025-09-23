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
import {saveAs} from 'file-saver-es';
import {FullNamePipe} from "../../../pipes/full-name.pipe";

declare const vgca_sign_msg: any;

@Component({
  selector: 'app-principal-subject-approval',
  templateUrl: './principal-subject-approval.component.html',
  styleUrls: ['./principal-subject-approval.component.scss']
})
export class PrincipalSubjectApprovalComponent implements OnInit {
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
  filterTeacherId: any;
  filterSubjectId: any;
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
  selectedItems: any[] = [];
  isShowSignLoadingPrincipal = false;
  isShowClassResultView = false;
  user: any;
  studentSource = [];
  selectedData: any;
  signInfos: any[] = [];
  signInfo: any;
  schoolInfo: any;
  isElementary = false;
  classMarkTitle: any;
  isShowClassResultViewC2 = false;
  staffInfo: any = {};
  teacherSource: any[] = [];
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;
  private intervalId: any;

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
    this.signInfos = [];
    this.signInfo = {};
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    this.schoolYearSource = this.service.getYearSource();
    this.classMarkTitle = 'Điểm môn học';
  };

  ngAfterViewInit() {
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.user = user;

    this.generalService.getListTeacherBySchool(this.user.data.schoolId).subscribe(res => {
      res.forEach(stf => {
        stf.name = this.fullNamePipe.transform(stf);
      })
      this.teacherSource = res;
    }, error => {
    });

    //this.chooseTeacher(user);
  }
  async chooseTeacher(user){
    this.isAdmin = user.data.role === 2;
    this.schoolId = user.data.schoolId;
    //console.log(user);
    forkJoin([
      this.generalService.getSchoolConfig(user.data.schoolId),
      this.generalService.getListSubjectByTeacher(user.data.schoolId, this.filterTeacherId),
      this.generalService.getListSubjectBySchool(user.data.schoolId)
    ]).subscribe(([schoolInfo, subjectSource, schoolSubjectSource]) => {
      this.subjectSource = subjectSource;
      console.log('subjectSource', subjectSource);
      if (this.user.data.isGVCN && schoolInfo.type === 1) {
        this.subjectSource = schoolSubjectSource;
        this.filterSubjectId = this.subjectSource[0].id;
      } else {
        this.filterSubjectId = this.subjectSource[0].id;
      }
      this.filterClassSource = this.classSource.filter(en => 1 === 1);
      //this.filterClassId = this.filterClassSource[0].id;
      this.loadGrid();
    });
    this.generalService.getSchoolConfig(user.data.schoolId).subscribe((res: any) => {
      this.schoolInfo = res;
      this.isElementary = res.type === 1;

    }, error => {

    });
    this.generalService.getStaffById(this.user.data.personId).subscribe(res => {
      this.staffInfo = res;
    }, error => {

    });
  }

  async loadGrid() {
    this.generalService.getDiemGVBM(this.schoolId, this.filterTeacherId, this.filterSchoolYear, this.filterSubjectId).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.studentCount = res.length;
      this.datas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  teacherChange($event) {
    this.filterTeacherId = $event.itemData.id;
    //this.loadGrid();
    this.chooseTeacher(this.user);
  }
  subjectChange($event) {
    this.filterSubjectId = $event.itemData.id;
    //this.getClassesBySubject();
    this.filterClassSource = this.classSource.filter(cls =>
      cls.teacherReferences &&
      cls.teacherReferences.some(ref =>
        (ref.teacherId === this.user.data.personId || ref.teacherId == this.user.data.id) && ref.subjectId === this.filterSubjectId
      )
    );
    this.filterClassId = this.filterClassSource[0].id;
    this.loadGrid();
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
        saveAs(new Blob([buffer], {type: 'application/octet-stream'}), `DS_HOCSINH_LOP_${clsName}.xlsx`);
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
  onSign = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);


    let result = confirm(`Bạn có chắc muốn ký xác nhận điểm môn học không?`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.startCountdown();
        this.isShowSignLoading = true;
        this.generalService.signByGVBM(this.dataItem.classId, this.filterSubjectId).subscribe(en => {
          this.isShowSignLoading = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Xác thực ký thành công');
            this.loadGrid();
            clearInterval(this.intervalId);
          } else if (en.code === 100) {
            this.notificationService.showNotification(Constant.ERROR, en.message);
            clearInterval(this.intervalId);
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Ký không thành công. Kiểm tra lại thông tin ký số');
            clearInterval(this.intervalId);
          }
        }, error => {

        });
      }
    });

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
    this.selectedItems = $event.selectedRowKeys.map(en => en.classId);  // Cập nhật hàng được chọn tại client
    console.log('Selected items:', this.selectedItems);
  }

  showDetail(data: any) {
    console.log(data);
    this.classMarkTitle = `Điểm môn học ${data.subjectName}`;
    this.selectedData = data;
    if (this.isElementary) {
      this.generalService.getDiemGVBMChiTiet(this.schoolId, this.user.data.personId, this.filterSchoolYear, this.filterSubjectId, data.classId).subscribe(res => {
        this.studentSource = res.lst;
        this.signInfo = res.signInfo;
        this.isShowClassResultView = true;
        let index = 1;
        this.studentSource.forEach(en => {
          en.stt = index++;
        });
      }, error => {
      });
    } else {
      this.generalService.getDiemGVBMChiTietC2(this.schoolId, this.user.data.personId, this.filterSchoolYear, this.filterSubjectId, data.classId).subscribe(res => {
        this.studentSource = res.lst;
        this.signInfos = res.signInfos;
        console.log('this.signInfos', this.signInfos);
        this.isShowClassResultViewC2 = true;
        let index = 1;
        this.studentSource.forEach(en => {
          en.stt = index++;
        });
      }, error => {
      });
    }
  }

  async requestSigned() {
    let result = confirm(`Bạn có chắc muốn ký xác nhận cho ${this.selectedItems.length} lớp không?`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.signWithTokenBCY_Mock();
      }
    });
  }

  async signWithTokenBCY() {
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
        let payload = {
          ids: this.selectedItems,
          subjectId: this.filterSubjectId
        }
        this.generalService.approveSubjectScoresByPrincipalViaMySign(payload).subscribe(en => {
          this.isShowSignLoading = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, 'Xác thực ký thành công');
            this.loadGrid();
          } else if (en.code === 100) {
            this.notificationService.showNotification(Constant.ERROR, en.message);
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Ký không thành công. Kiểm tra lại thông tin chứng thư số');
          }
        }, error => {

        });
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Ký số không thành công');
      }
    });
  }
  async signWithTokenBCY_Mock() {
    let payload = {
      ids: this.selectedItems,
      subjectId: this.filterSubjectId,
      teacherId: this.filterTeacherId,
    }
    this.generalService.approveSubjectScoresByPrincipalViaMySign(payload).subscribe(en => {
      this.isShowSignLoading = false;
      if (en.code === 0) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Xác thực ký thành công');
        this.loadGrid();
      } else if (en.code === 100) {
        this.notificationService.showNotification(Constant.ERROR, en.message);
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Ký không thành công. Kiểm tra lại thông tin chứng thư số');
      }
    }, error => {

    });
  }
}
