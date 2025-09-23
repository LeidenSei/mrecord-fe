import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GeneralService} from "../../../services/general.service";
import {lastValueFrom} from 'rxjs';
import {DxDataGridComponent} from "devextreme-angular";
import {Router} from "@angular/router";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import { confirm } from 'devextreme/ui/dialog';
import {NotificationService} from "../../../services/notification.service";
import {Constant} from "../../../shared/constants/constant.class";
@Component({
  selector: 'app-car-insurance',
  templateUrl: './car-insurance.component.html',
  styleUrls: ['./car-insurance.component.scss']
})
export class CarInsuranceComponent implements OnInit{
  isDataChanged: false;
  isContentScrolled = false;
  dataSource = [];
  itemId: number;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  constructor(
    httpClient: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private generalService: GeneralService) {
  }
  ngOnInit(): void {
    this.getListData();
  }
  getListData(){
    this.generalService.getDsBaoHiemOto().subscribe(res => {
      if (res !== null) {
        this.dataSource = res;
        this.dataSource.forEach(en =>{
          en.statusText = this.toStatus(en);
        });
      }
    }, error => {

    });
  }
  cancel() {

  }

  save() {

  }
  scroll({reachedTop = false}) {
    this.isContentScrolled = !reachedTop;
  }
  refresh = () => {
    //this.dataGrid.instance.refresh();
    this.getListData();
  };
  onEditClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    console.log(e.row.data);
    /*this.router.navigate(['/mvp/add', e.row.data.id]);
    e.event.preventDefault();*/
    this.router.navigate([`/mvp/edit/${e.row.data.id}`]);
  };
  onDeleteClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    let data = e.row.data;
    const result = confirm(`Bạn có chắc chắn muốn xóa hồ sơ khách hàng: ${data.khachHangTen} này?`, 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.deleteBaoHiem(data.id).subscribe(en => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Xóa hồ sơ thành công');
          this.getListData();
        }, error => {

        });
      }
    });
  };
  goEdit(data: any) {
    this.router.navigate([`/mvp/edit/${data.id}`]);
  }
  rowClick($event) {

  }

  onExporting($event) {

  }

  addItemClick() {
    this.router.navigate(['/mvp/add']);
  }

  private toStatus(en: any) {
    switch (en.status) {
      case 0:
        return 'Mới thêm';
      case 1:
        return 'Chờ duyệt';
      case 2:
        return 'Đã duyệt';
      case 9:
        return 'Chuyển KT';
      case 99:
        return 'Từ chối';
    }
  }
}
