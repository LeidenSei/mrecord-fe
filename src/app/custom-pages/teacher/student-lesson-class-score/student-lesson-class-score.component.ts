import {ChangeDetectorRef, Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import {forkJoin} from 'rxjs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { ExportingEvent } from 'devextreme/ui/data_grid';

import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import {FullNamePipe} from "../../../pipes/full-name.pipe";

@Component({
  selector: 'app-student-lesson-class-score',
  templateUrl: './student-lesson-class-score.component.html',
  styleUrls: ['./student-lesson-class-score.component.scss']
})
export class StudentLessonClassScoreComponent  implements OnInit{
  @Input() baiGiang: any;
  @Input() user:any;
  studentSource: any[];
  filterClassId: any;
  classSource: any[];
  selectedIndex = 0;
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
    if (changes['baiGiang'] && !changes['baiGiang'].isFirstChange()) {
      this.refreshData(changes['baiGiang'].currentValue);
    }
  }
  refreshData(baiGiangItem: any): void {
    this.classSource = baiGiangItem.classes;
    this.classSource.forEach(en => {
      en.text = en.name;
    });
    forkJoin([
      this.generalService.getListStudentByClass(baiGiangItem.selectedClassId),
    ]).subscribe(([studentSource]) => {
      this.studentSource = studentSource;
      let payload = {
        khoaHocId: baiGiangItem.khoaHocId,
        baiGiangId: baiGiangItem.id,
        classId: baiGiangItem.selectedClassId,
      };
      this.generalService.getKetQuaLamBaiKhoaHoc(payload).subscribe(res => {
        let index = 1;
        this.studentSource.forEach(en => {
          let resItem = res.find(kq => kq.hocSinh.id === en.id);
          let ketQua = resItem ? resItem.ketQua.ketQuaBaiGiang[0] : null;
          en.stt = index++;
          en.className = this.classSource.find(x => x.id === en.classId)?.name;
          en.ngayHoanThanh = ketQua ? ketQua.ngayHoanThanh : '';
          //en.diem = ketQua ? (ketQua.diem + '/' + ketQua.tongDiem) : '';
          if (ketQua) {
            en.seen = (ketQua && ketQua.baiGiang && ketQua.baiGiang.viewerIds.includes(en.id)) ? '✔' : '';
            const diemMoiCau =  10 / ketQua.soCauHoi;
            const diem =  parseFloat((diemMoiCau * ketQua.soCauDung).toFixed(2));
            en.diem = diem;
            en.caudung = `${ketQua.soCauDung}/${ketQua.soCauHoi}`;
          }
          en.fullName = this.fullNamePipe.transform(en);
          //tinh lai diem

        });
      }, error => {
      });
    });
  }

  classChange($event) {
    console.log($event);
    this.filterClassId = $event.itemData.id;
    //alert(this.filterClassId);
    this.baiGiang.selectedClassId = $event.itemData.id;
    //this.selectedIndex = 1;
    this.refreshData(this.baiGiang);
  }

  onExporting(e: ExportingEvent) {
    /*const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');*/

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('DsHocSinh');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `KETQUALAMBAI_${this.baiGiang.name.toUpperCase()}.xlsx`);
      });
    });
    e.cancel = true;
  }
}
