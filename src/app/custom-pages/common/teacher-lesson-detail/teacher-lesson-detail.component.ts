import {ChangeDetectorRef, Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {FullNamePipe} from "../../../pipes/full-name.pipe";
import {ExportingEvent} from "devextreme/ui/data_grid";
import {Workbook} from "exceljs";
import { saveAs } from 'file-saver-es';
import {exportDataGrid as exportDataGridToXLSX} from "devextreme/excel_exporter";

@Component({
  selector: 'app-teacher-lesson-detail',
  templateUrl: './teacher-lesson-detail.component.html',
  styleUrls: ['./teacher-lesson-detail.component.scss']
})
export class TeacherLessonDetailComponent implements OnInit{
  @Input() payload:any;
  dataSource: any[];
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel', // Xuất tất cả dữ liệu
    exportSelectedRows: 'Export selected rows to Excel', // Xuất các dòng đã chọn
    exportTo: 'Export data', // Tiêu đề tổng
  };
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private fullNamePipe: FullNamePipe,
              private ref: ChangeDetectorRef) {
  }
  async ngOnInit() {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payload'] && !changes['payload'].isFirstChange()) {
      this.refreshData(changes['payload'].currentValue);
    }
  }
  refreshData(payload: any): void {
    this.generalService.getThongKeBaiGiangGiaoVien(payload).subscribe(res => {
      this.dataSource = res;
      let stt = 1;
      this.dataSource.forEach(en => {
        en.stt = stt;
        stt++;
      });
    });
  }
  onExporting(e: ExportingEvent) {
    /*const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');*/

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('BaiGiang');

    const formattedFromDate = this.formatDate(this.payload.fromDate);
    const formattedToDate = this.formatDate(this.payload.toDate);
    const fileName = `TKBG_GV_${this.payload.staffName}_tu_${formattedFromDate}_den_${formattedToDate}.xlsx`;

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
      });
    });
    e.cancel = true;

    /*exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      customizeCell: function(options) {
        options.excelCell.font = { name: 'Arial', size: 12 };
        options.excelCell.alignment = { horizontal: 'left' };
      }
    }).then(function() {
      workbook.xlsx.writeBuffer()
        .then(function(buffer: BlobPart) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
        });
    });*/
  }
  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Tháng tính từ 0, nên cần +1
    const year = date.getFullYear().toString().slice(-2); // Lấy 2 chữ số cuối của năm
    return `${day}_${month}_${year}`;
  }
}
