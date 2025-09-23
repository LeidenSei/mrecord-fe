import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DxValidationGroupComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {FullNamePipe} from "../../../pipes/full-name.pipe";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {Constant} from "../../../shared/constants/constant.class";
import {forkJoin} from 'rxjs';
import {Workbook} from 'exceljs';
import {saveAs} from 'file-saver-es';
import {ExportingEvent} from 'devextreme/ui/data_grid';
import {exportDataGrid as exportDataGridToXLSX} from "devextreme/excel_exporter";
import {DataGridColumn} from "../../../types/gridColumn";

@Component({
  selector: 'app-statistic-content',
  templateUrl: './statistic-content.component.html',
  styleUrls: ['./statistic-content.component.scss']
})
export class StatisticContentComponent implements OnInit {
  isShowConfig = false;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  gradeSource = [];
  ttcmGradeSource = [];
  subjectSource = [];
  classSource = [];
  teacherSource = [];
  arrImg = [];

  filterGrade: 0;
  filterStatus: -1;
  filterClassIds = [];
  filterClassId: any;
  studentCount: 0;
  user: any;
  ttcmKhoiItems: any[] = [];
  columns: any[] = [];
  isLoading = true;
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel', // Xuất tất cả dữ liệu
    exportSelectedRows: 'Export selected rows to Excel', // Xuất các dòng đã chọn
    exportTo: 'Export data', // Tiêu đề tổng
  };
  dynamicColumns: any[] = [];
  fromDate: any;
  toDate: any;
  viewResultTitle: any;
  isShowResultView = false;
  detailItem: any;
  wHeight: any;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

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
    forkJoin([
      this.generalService.getListTeacherBySchool(this.user.data.schoolId),
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId)
    ]).subscribe(([teacherSource, gradeSource, subjectSource]) => {
      this.teacherSource = teacherSource.filter(en => en.staffType === 1);
      this.gradeSource = gradeSource;
      this.teacherSource.forEach(en => {
        en.fullName = this.fullNamePie.transform(en);
      });
      // @ts-ignore
      const columns: DataGridColumn[] = [
        {dataField: 'stt', caption: 'STT', width: 55, fixed: true, fixedPosition: 'left'},
        {dataField: 'hoTen', caption: 'Họ tên', width: 200, fixed: true, fixedPosition: 'left'},
        {dataField: 'lop', caption: 'Lớp', width: 100, fixed: true, fixedPosition: 'left'}
      ];
      this.dynamicColumns = [];
      subjectSource.forEach(en => {
        const colName = `soKhoaHocMonHoc_${en.id}`;
        this.dynamicColumns.push(colName); // Lưu lại danh sách các cột động
        columns.push({
          width: 120,
          caption: `${en.name}`,
          dataField: colName,
          fixed: false
        });
      });
      // @ts-ignore
      // @ts-ignore
      // @ts-ignore
      columns.push({
        fixedPosition: 'right',
        fixed: true,
        dataField: 'tongSoKhoaHoc',
        caption: 'Tổng bài giảng',  // Cột tính tổng theo dòng
        width: 150,
        calculateCellValue: (data) => {
          // Tính tổng cho các cột có tên trong dynamicColumns
          return this.dynamicColumns.reduce((sum, col) => sum + (data[col] || 0), 0);
        },
        summaryType: 'sum'  // Tính tổng theo dòng
      });
      columns.push({
        fixedPosition: 'right',
        fixed: true,
        type: 'buttons',
        buttons: [
          {
            icon: 'info',
            onClick: (e) => {
              // Gọi hàm mở popup tại đây
              this.openPopupDetail(e.row.data);
            }
          }
        ],
        width: 100,
        caption: 'Actions'
      })
      this.columns = columns;
      this.loadGrid();
    });
    this.wHeight = (window.innerHeight - 150) + 'px';
  }

  async loadGrid() {
    let payload = {
      "fromDate": this.fromDate,
      "toDate": this.toDate,
      "schoolId": this.user.data.schoolId
    }
    if (!this.fromDate || !this.toDate) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập bộ lọc từ ngày đến ngày để xem thống kê!');
      this.isLoading = false;
      return;
    }
    this.generalService.getThongKeBaiGiangGiaoVienTCM(payload).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.datas.forEach(en => {
        en.stt = index++;
      });
      this.isLoading = false;
    }, error => {
    });
  }

  openPopupDetail(data) {

    const formattedFromDate = this.formatDate2(this.fromDate);
    const formattedToDate = this.formatDate2(this.toDate);

    this.viewResultTitle = `Danh sách bài giảng của giáo viên ${data.hoTen} thời gian từ ${formattedFromDate} - ${formattedToDate}`;
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
    /*const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');*/

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('TKBG');

    const formattedFromDate = this.formatDate(this.fromDate);
    const formattedToDate = this.formatDate(this.toDate);
    const fileName = `THONG_KE_BAI_GIANG_tu_${formattedFromDate}_den_${formattedToDate}.xlsx`;
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
}
