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
  selector: 'app-student-sync-list-c2',
  templateUrl: './student-sync-list-c2.component.html',
  styleUrls: ['./student-sync-list-c2.component.scss']
})
export class StudentSyncListC2Component implements OnInit {
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
  selectedTranscriptIds: any[] = [];
  isShowSignLoadingPrincipal = false;
  isElementary = true;
  schoolInfo: any;
  teacherSubjects = [];
  status40Count: number = 0;
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
      this.filterGrade = this.gradeSource[0];
      if (this.filterGrade) {
        this.filterClassSource = this.classSource.filter(en => en.grade === this.filterGrade);
      } else {
        this.filterClassSource = this.classSource.filter(en => 1 === 1);
      }
      this.filterClassId = this.filterClassSource[0].id;
      this.loadGrid();

      //this.gradeSource.unshift('Tất cả');
    });
    this.generalService.getSchoolConfig(user.data.schoolId).subscribe((res: any) => {
      this.schoolInfo = res;
      this.isElementary = res.type === 1;
    }, error => {

    });
  }

  async loadGrid() {
    this.generalService.getListStudentHocBa(this.schoolId, this.filterClassId, this.filterSchoolYear).subscribe(res => {
      this.datas = res.datas;
      let index = 1;
      this.studentCount = res.datas.length;
      this.datas.forEach(en => {
        en.stt = index++;
        en.originalFileUrl = 'https://media.mschool.edu.vn' + en.hocba?.originalFileUrl + '?v=' + new Date().getMilliseconds();
        let replaceTo = '.xml';
        if (en.hocba && en.status) {
          switch (en.hocba.status) {
            case 50:
              replaceTo = '_release.xml';
              break;
            case 40:
              replaceTo = '_cbql.xml';
              break;
            case 20:
              replaceTo = '_gvcn.xml';
              break;
          }
          en.xmlFile = en.originalFileUrl.replace('.pdf', replaceTo) + '?v=' + new Date().getMilliseconds();
        }
      });
      console.log(res.teachers);

      const summary = {};

      res.teachers.forEach(({ subjectName, signed, teacher }) => {
        const key = subjectName.trim();
        if (!summary[key]) {
          summary[key] = { signedCount: 0, total: 0, unsignedTeachers: [] };
        }
        summary[key].total += 1;
        if (signed) {
          summary[key].signedCount += 1;
        } else {
          summary[key].unsignedTeachers.push(teacher);
        }
      });

      const result = Object.entries(summary as Record<string, { signedCount: number; total: number, unsignedTeachers: any[] }>).map(
        ([name, { signedCount, total, unsignedTeachers }]) => ({
          subjectName: name,
          signedCount: signedCount,
          total: total,
          signed: signedCount == total,
          text: signedCount === total ? 'Đã ký' : `${signedCount}/${total}`,
          unsignedTeachers: unsignedTeachers
        })
      );
      this.teacherSubjects = result;
      console.log('result', result);

    }, error => {
    });
  }
  toSignedCheck(subjectName: any){
    //console.log(subjectName, datas);
    let item = this.teacherSubjects.find(en => en.subjectName === subjectName);
    if (item && item.signed) {
      return "Đã ký";
    } else {
      if (item.total > 1)
        return 'GV chưa ký: ' + item.unsignedTeachers;
      else
        return '';
    }
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
  }SSOLoginModel

  handleSelectionChange($event) {
    this.selectedItems = $event.selectedRowKeys.map(en => en.id);  // Cập nhật hàng được chọn tại client
    this.selectedTranscriptIds = $event.selectedRowKeys.filter(en => en.hocba).map(en => en.hocba.id);
    this.status40Count = $event.selectedRowKeys.filter(en => en.hocba && en.hocba.status >= 40).length;
    console.log('Selected items:', this.selectedItems, this.selectedTranscriptIds);
  }

  doGenerate() {
    let result = confirm(`Bạn có chắc muốn khởi tạo học bạ của  ${this.selectedItems.length} học sinh không`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;

        let payload = {
          schoolYear: this.filterSchoolYear,
          classId: this.filterClassId,
          schoolId: this.schoolId,
          studentIds: this.selectedItems,
        }
        this.generalService.generateHocBaTheoLopOld(payload, this.isElementary).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, `Khởi tạo học bạ thành công. Có ${en.message} học bạ được khởi tạo thành công`);
            this.loadGrid();
          } else if (en.code === 97){
            this.notificationService.showNotification(Constant.ERROR, `Khởi tạo học bạ không thành công. ${en.message}`);
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Khởi tạo học bạ không thành công. Chưa có dữ liệu để khởi tạo');
          }
        }, error => {

        });
      }
    });


  }

  doRemove() {
    let result = confirm(`Bạn có chắc muốn xóa học bạ của  ${this.selectedItems.length} học sinh không`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;

        let payload = {
          ids: this.selectedTranscriptIds,
        }
        this.generalService.removeHocBa(payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, `Xóa học bạ thành công`);
            this.loadGrid();
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Xóa học bạ không thành công');
          }
        }, error => {

        });
      }
    });
  }

  doFixPDF() {
    let result = confirm(`Bạn có chắc muốn cập nhật PDF học bạ của ${this.selectedItems.length} học sinh không`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;

        let payload = {
          ids: this.selectedTranscriptIds,
        }
        this.generalService.fixPDF(payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, `Cập nhật học bạ thành công. Vui lòng kiểm tra lại sau vài giây để quá trình hoàn tất`);
            this.loadGrid();
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Cập nhật học bạ không thành công');
          }
        }, error => {

        });
      }
    });
  }
  doFixXML() {
    let result = confirm(`Bạn có chắc muốn cập nhật XML học bạ của ${this.selectedItems.length} học sinh không`, 'Xác nhận ký');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isShowSignLoadingPrincipal = true;

        let payload = {
          ids: this.selectedTranscriptIds,
        }
        this.generalService.fixXML(payload).subscribe(en => {
          this.isShowSignLoadingPrincipal = false;
          if (en.code === 0) {
            this.notificationService.showNotification(Constant.SUCCESS, `Cập nhật bạ thành công. Vui lòng kiểm tra lại sau vài giây để quá trình hoàn tất`);
            this.loadGrid();
          } else {
            this.notificationService.showNotification(Constant.ERROR, 'Cập nhật học bạ không thành công');
          }
        }, error => {

        });
      }
    });
  }
}
