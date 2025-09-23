import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import {HttpClient, HttpParams} from "@angular/common/http";
import {lastValueFrom} from 'rxjs';
import CustomStore from 'devextreme/data/custom_store';
import {LoadOptions} from 'devextreme/data';
import {GeneralService} from "../../../services/general.service";
import {DxDropDownButtonTypes} from "devextreme-angular/ui/drop-down-button";
import {DxDataGridComponent} from "devextreme-angular";
import {getSizeQualifier} from 'src/app/services/screen.service';
import {Constant} from "../../../shared/constants/constant.class";
import {NotificationService} from "../../../services/notification.service";
import {Router} from "@angular/router";
import {FormPopupComponent} from "../../../components";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";

import * as moment from 'moment';
import {DataService} from "../../../services";
@Component({
  selector: 'app-car-customer',
  templateUrl: './car-customer.component.html',
  styleUrls: ['./car-customer.component.scss']
})
export class CarCustomerComponent {
  @ViewChild(DxDataGridComponent, {static: true}) dataGrid: DxDataGridComponent;
  @ViewChild("formUser") formUser: FormPopupComponent;
  @Output() customerSelect = new EventEmitter<any>();

  customersData: AspNetData.CustomStore;
  shippersData: AspNetData.CustomStore;
  dataSource: AspNetData.CustomStore;
  getSizeQualifier = getSizeQualifier;
  url: string;
  searchData: any = {
    name: '',
    phone: '',
    email: ''
  };
  hasChoosen = false;
  isPopupEditOpened = false;
  newUser: any;
  isEdit = true;
  constructor(
    httpClient: HttpClient,
    private generalService: GeneralService,
    private notificationService: NotificationService,
    private service: DataService,
    private router: Router,
    ) {
    this.newUser = {};
    this.searchData = {
      name: '',
      phone: '',
      email: ''
    };
    const isNotEmpty = (value: unknown) => (value !== undefined && value !== null && value !== '');
    this.dataSource = new CustomStore({
      async load(loadOptions: LoadOptions) {
        //console.log(loadOptions);
        const paramNames = [
          'skip', 'take', 'requireTotalCount', 'requireGroupCount',
          'sort', 'filter', 'totalSummary', 'group', 'groupSummary',
        ];
        let params = new HttpParams();
        paramNames
          .filter((paramName) => isNotEmpty(loadOptions[paramName]))
          .forEach((paramName) => {
            params = params.set(paramName, JSON.stringify(loadOptions[paramName]));
          });
        try {
          let result = await lastValueFrom(generalService.getDmKhachHangs(loadOptions));
          return {
            data: result.data,
            totalCount: result.total,
            summary: 10000,
            groupCount: 10,
          };
        } catch (err) {
          throw new Error('Data Loading Error');
        }
      },
    });
  }

  filterByStatus = (status: number) => {
    console.log(this.dataGrid.instance.getSelectedRowKeys());
    if (status === 0) {
      this.dataGrid.instance.clearFilter();
    } else {
      this.dataGrid.instance.filter(this.searchData);
    }
  };
  refresh = () => {

  };

  selectionChange($event: any) {
    this.hasChoosen = this.dataGrid.instance.getSelectedRowKeys().length === 1;
  }

  chooseCustomer() {
    let obj = this.dataGrid.instance.getSelectedRowKeys()[0];
    this.customerSelect.emit(obj);
    this.dataGrid.instance.clearSelection();
  }
  onEditClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    console.log(e.row.data);
    this.newUser = Object.assign({}, e.row.data);
    this.isPopupEditOpened = true;
    e.event.preventDefault();
  };
  showPopupAddNew() {
    this.isPopupEditOpened = true;
    this.newUser = {
    };
    this.isEdit = false;
    setTimeout(() => {
      this.formUser.resetValidate();
    }, 0);
  }

  async save() {
    if (this.formUser.isValid()) {
      if (this.newUser.id) {
        this.saveUpdate();
      } else {
        this.saveAdd();
      }
    } else {
      this.notificationService.showNotification(Constant.ERROR, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }
  async saveAdd() {
    let res = await this.generalService.addKhachHang(this.newUser).toPromise();
    console.log(res);
    this.notificationService.showNotification(Constant.SUCCESS, 'Thêm mới khách hàng thành công');
    this.isPopupEditOpened = false;
    this.dataGrid.instance.refresh();

  }

  async saveUpdate() {
    let res = await this.generalService.updateKhachHang(this.newUser).toPromise();
    console.log(res);
    this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật khách hàng thành công');
    this.isPopupEditOpened = false;
    this.dataGrid.instance.refresh();
  }


}
