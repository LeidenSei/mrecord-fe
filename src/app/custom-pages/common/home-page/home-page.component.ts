import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SalesOrOpportunitiesByCategory} from "../../../types/analytics";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {forkJoin} from 'rxjs';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  isContentScrolled = false;
  data = null;
  dataChartTheoKhoi = [];
  dataChartTyLeGiaoVien = [];
  totalTheoKhoi = 0;
  totalGiaoVien = 0;
  soKhoaHoc = 0;
  soHocLieu = 0;
  dataTopGV = [];
  user: any;
  dataTkBaiTap: any;
  role: number;
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private router: Router,
              private ref: ChangeDetectorRef) {

  };
  customizeSaleText(e: any) {
    return `${e.argumentText}: ${e.valueText}`;
  }
  async ngOnInit() {
    this.data = [{value: 123333, name: "Cơ hội"}];
    this.user  = await this.authService.getUser();
    this.role = this.user.data.role;
    if (this.user.data.role !== 8) {
      forkJoin([
        this.generalService.top3GVTC(),
        this.generalService.thongKeGVSuDung(),
        this.generalService.thongKeTheoKhoi(),
        this.generalService.getTKHocBa(this.user.data.schoolId)
      ]).subscribe(([gvSource, sudungSource, theoKhoiSource, tkSource]) => {
        this.dataChartTheoKhoi = theoKhoiSource.detail;
        this.dataChartTheoKhoi.forEach(en => {
          en.grade = 'Khối ' + en.grade;
        });
        this.dataChartTyLeGiaoVien = [
          {label: 'Số GV chưa sử dụng', value: sudungSource.chuaSuDung},
          {label: 'Số GV đã sử dụng', value: sudungSource.daSuDung},
        ];
        this.totalGiaoVien = sudungSource.total;
        this.totalTheoKhoi = theoKhoiSource.total;
        this.dataTopGV = gvSource;
        this.dataTkBaiTap = tkSource;
      });
    } else {
      forkJoin([
        this.generalService.thongKeNoiDungPGD(),
      ]).subscribe(([tkSource]) => {
        this.dataTkBaiTap = tkSource;
      });
      forkJoin([
        this.generalService.thongKeGVSuDung(),
        this.generalService.thongKeTheoKhoi(),
      ]).subscribe(([sudungSource, theoKhoiSource]) => {
        this.dataChartTheoKhoi = theoKhoiSource.detail;
        this.dataChartTheoKhoi.forEach(en => {
          en.grade = 'Khối ' + en.grade;
        });
        this.dataChartTyLeGiaoVien = [
          {label: 'Số GV chưa sử dụng', value: sudungSource.chuaSuDung},
          {label: 'Số GV đã sử dụng', value: sudungSource.daSuDung},
        ];
        this.totalGiaoVien = sudungSource.total;
        this.totalTheoKhoi = theoKhoiSource.total;
        this.dataTopGV = [];
      });
    }
  }

  scroll({reachedTop = false}) {
    this.isContentScrolled = !reachedTop;
  }
  pointClickHandler(arg) {
    console.log(arg.target.data);
    arg.target.select();
  }

  onBarPointClick($event) {

  }
}
