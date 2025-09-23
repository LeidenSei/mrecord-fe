import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DxValidationGroupComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {FullNamePipe} from "../../../pipes/full-name.pipe";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {DataGridColumn} from "../../../types/gridColumn";
import {Constant} from "../../../shared/constants/constant.class";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {ExportingEvent} from "devextreme/ui/data_grid";
import {Workbook} from "exceljs";
import {forkJoin} from 'rxjs';
import {saveAs} from 'file-saver-es';
import {exportDataGrid as exportDataGridToXLSX} from "devextreme/excel_exporter";

@Component({
  selector: 'app-homework-completion-statistics',
  templateUrl: './homework-completion-statistics.component.html',
  styleUrls: ['./homework-completion-statistics.component.scss']
})
export class HomeworkCompletionStatisticsComponent implements OnInit {
  isShowConfig = false;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  gradeSource = [];
  classSource = [];
  teacherSource = [];
  arrImg = [];

  filterGrade: 0;
  filterStatus: -1;
  filterClassIds = [];
  filterClassId: any;
  studentCount: 0;
  user: any;
  columns: any[] = [];
  isLoading = true;
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel', // Xuất tất cả dữ liệu
    exportSelectedRows: 'Export selected rows to Excel', // Xuất các dòng đã chọn
    exportTo: 'Export data', // Tiêu đề tổng
  };
  fromDate: any;
  toDate: any;
  viewResultTitle: any;
  isShowResultView = false;
  detailItem: any;
  wHeight: any;
  monthSource: any[] = [];
  subjectSource: any[] = [];
  filterSubjectId: any;
  studentDatas: any[] = [];

  viewBaiGiangDetailTitle: any = '';
  isShowBaiGiangView: boolean = false;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  baigGiangSource: any[] = [];
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              public fullNamePie: FullNamePipe,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.dataItem = {};
  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    const today = new Date();
    // Thiết lập giá trị mặc định cho fromDate (2 tuần trước) và toDate (hôm nay)
    this.fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
    this.toDate = today;

    this.user = await this.authService.getUser();
    this.monthSource = [];
    for (let i = 8; i <= 12; i++) {
      this.monthSource.push({id: `${i}-${this.user.data.currentYear}`, name: `Tháng ${i < 10 ? '0' + i : '' + i}/${this.user.data.currentYear}`});
    }
    for (let i = 1; i <= 7; i++) {
      this.monthSource.push({id: `${i}-${this.user.data.currentYear}`, name: `Tháng 0${i}/${this.user.data.currentYear + 1}`});
    }

    //alert(this.user.data.currentYear);
    forkJoin([
      this.generalService.getListTeacherBySchool(this.user.data.schoolId),
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId),
      this.generalService.getListSubjectByTeacher(this.user.data.schoolId, this.user.data.personId)
    ]).subscribe(([teacherSource, gradeSource, subjectSource, teacherSubjectSource]) => {
      this.teacherSource = teacherSource.filter(en => en.staffType === 1);
      this.gradeSource = gradeSource;
      if (this.user.data.role === 3){
        this.subjectSource = teacherSubjectSource;
      } else {
        this.subjectSource = subjectSource;
      }
      if (!teacherSubjectSource.length){
        this.subjectSource = subjectSource;
      }

      this.teacherSource.forEach(en => {
        en.fullName = this.fullNamePie.transform(en);
      });
      this.filterSubjectId = this.subjectSource[0].id;
      this.loadGrid();
    });
    this.wHeight = (window.innerHeight - 150) + 'px';
  }

  async loadGrid() {
    let payload = {
      subjectId: this.filterSubjectId,
      schoolId: this.user.data.schoolId
    }
    this.generalService.getThongKeTyLeHoanThanhBTVN(payload).subscribe(res => {
      console.log(res);
      this.isLoading = false;
      this.datas = res;
      let stt = 1;
      this.datas.forEach(en => {
        en.stt = stt++;
      });
    }, error => {
    });
  }

  openPopupDetail(data) {

    const formattedFromDate = this.formatDate2(this.fromDate);
    const formattedToDate = this.formatDate2(this.toDate);

    this.viewResultTitle = `Danh sách BTVN của giáo viên ${data.hoTen} thời gian từ ${formattedFromDate} - ${formattedToDate}`;
    this.isShowResultView = true;
    this.detailItem = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      schoolId: this.user.data.schoolId,
      teacherId: data.staffId,
      staffName: data.hoTen
    };
    //console.log(data);
  }

  onDetailClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    this.openPopupDetail(this.dataItem);
  };

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  saveHomeWork(isShowConfig) {

  }

  closePopupEdit() {

    this.isShowResultView = false;
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

  changeTTCM($event, data) {
    data.changed = true;
    //data.ttcmId = $event;
  }


  closeConfig() {
    this.isShowConfig = false;
  }


  onExporting(e: ExportingEvent) {
    const toDay = new Date();
    /*const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');*/

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('TKBG');

    const formattedFromDate = this.formatDate(this.fromDate);
    const formattedToDate = this.formatDate(this.toDate);

    let subject = this.subjectSource.find(en => en.id === this.filterSubjectId);

    const fileName = `THONG_KE_TY_LE_HOAN_THANH_BTVN_${subject?.name}.xlsx`;
    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], {type: 'application/octet-stream'}), fileName);
      });
    });
    e.cancel = true;
  }

  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Tháng tính từ 0, nên cần +1
    const year = date.getFullYear().toString().slice(-2); // Lấy 2 chữ số cuối của năm
    return `${day}_${month}_${year}`;
  }

  formatDate2(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Tháng tính từ 0, nên cần +1
    const year = date.getFullYear().toString().slice(-2); // Lấy 2 chữ số cuối của năm
    return `${day}/${month}/${year}`;
  }

  applyDateFilter() {
    this.isLoading = true;
    this.loadGrid();
  }

  subjectChange($event) {
    this.filterSubjectId = $event.itemData.id;
    this.loadGrid();
  }

  viewCompleteStudents(compeleteIds: any, classId: any, className) {
    let subject = this.subjectSource.find(en => en.id === this.filterSubjectId);
    this.viewResultTitle = `Danh sách học sinh đã hoàn thành bài giảng môn ${subject.name} lớp: ${className}`;
    this.isShowResultView = true;
    const payload = {
      ids: compeleteIds,
      classId,
      subjectId: this.filterSubjectId,
      schoolId: this.user.data.schoolId
    }
    this.generalService.getStudentWithCompleteRate(payload).subscribe(res => {
      this.studentDatas = res;
      let index = 1;
      this.studentDatas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }
  viewIncompleteStudents(inompeleteIds: any, classId: any, className) {
    let subject = this.subjectSource.find(en => en.id === this.filterSubjectId);
    this.viewResultTitle = `Danh sách học sinh chưa hoàn thành bài giảng môn ${subject.name} lớp: ${className}`;
    this.isShowResultView = true;
    const payload = {
      ids: inompeleteIds,
      classId,
      subjectId: this.filterSubjectId,
      schoolId: this.user.data.schoolId
    }
    this.generalService.getStudentWithCompleteRate(payload).subscribe(res => {
      this.studentDatas = res;
      let index = 1;
      this.studentDatas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }

  showKqBaiGiangDetail(obj: any) {
    console.log(obj);
    var fullName = this.fullNamePie.transform(obj.student);
    this.viewBaiGiangDetailTitle = fullName;
    this.isShowBaiGiangView = true;
    this.baigGiangSource = obj.baiGiangs;
    let stt = 1;
    this.baigGiangSource.forEach(en => {
      en.stt = stt;
      stt++;
    });
  }
}
