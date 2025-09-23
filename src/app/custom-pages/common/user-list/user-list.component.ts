import {Component, OnInit, ViewChild} from '@angular/core';
import {GeneralService} from "../../../services/general.service";
import {FormBuilder} from "@angular/forms";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {getSizeQualifier} from 'src/app/services/screen.service';
import {FormPopupComponent} from "../../../components";
import {DxTextBoxTypes} from "devextreme-angular/ui/text-box";
import {Constant} from "../../../shared/constants/constant.class";
import {NotificationService} from "../../../services/notification.service";
import {DataService} from "../../../services";

type EditorOptions = DxTextBoxTypes.Properties;

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @ViewChild("formAddUser") formAddUser: FormPopupComponent;
  @ViewChild("formEditUser") formEditUser: FormPopupComponent;
  namePattern = /^[^0-9]+$/;
  currentFilter: any;
  datas = [];
  loading: boolean;
  allRoles: any[];
  isUserPopupOpened = false;
  isEditUserPopupOpened = false;
  getSizeQualifier = getSizeQualifier;
  newUser: any;
  isEdit: boolean = true;

  constructor(
    private generalService: GeneralService,
    private fb: FormBuilder,
    private service: DataService,
    private notificationService: NotificationService,
  ) {
    this.newUser = {firstName: ''};
  }

  ngOnInit(): void {
    this.getAllRole();
    this.getListData();
  }

  getAllRole() {


    this.generalService.getRole().subscribe(res => {
      if (res !== null) {
        this.allRoles = res;
      }
    }, error => {

    });
  }
  async test(){
    let ret = await this.generalService.getTaikhoan().toPromise();
    return 'abc';
  }
  async getListData() {
    this.loading = true;
    await console.log(this.test());
    this.generalService.getTaikhoan().subscribe(res => {
      if (res !== null) {
        this.datas = res;
        this.loading = false;
        this.datas.forEach(en => {
          en.roleText = this.getQuyen(en.userRoles);
        });
        console.log(this.datas);
      }
    }, error => {

    });
  }

  onEditClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    console.log(e.row.data);
    this.newUser = Object.assign({}, e.row.data);
    this.isEditUserPopupOpened = true;
    e.event.preventDefault();
  };
  onDeleteClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    console.log(e.row.data);
    e.event.preventDefault();
  };
  nameEditorOptions: EditorOptions = {
    valueChangeEvent: 'keyup',
  };

  getQuyen(roles) {
    let s = '';
    for (let i = 0; i < roles.length; i++) {
      if (s === '')
        s += this.getTenQuyen(roles[i].roleId);
      else
        s += '. ' + this.getTenQuyen(roles[i].roleId);
    }
    return s;
  }

  getTenQuyen(role) {
    for (let i = 0; i < this.allRoles.length; i++) {
      if (role === this.allRoles[i].id)
        return this.allRoles[i].name;
    }
  }

  getRoles(userRole) {
    const s = [];
    for (var i = 0; i < userRole.length; i++) {
      s[i] = userRole[i].roleId;
    }
    return s;
  }

  addUser() {
    this.isUserPopupOpened = true;
    this.newUser = {
      "fullname": "",
      "username": "",
      "phoneNo": "",
      "email": "",
      "status": 1,
      "password": "",
      "repeatPassword": "",
      "roles": [],
      "signatureImageUrl": "",
      "verifyCode": ""
    };
    this.isEdit = false;
    setTimeout(() => {
      this.formAddUser.resetValidate();
    }, 0);
  }

  onClickAddUser() {
    if (this.formAddUser.isValid()) {
      this.addTaiKhoan();
    }
  }

  onClickSaveUser() {
    if (this.formEditUser.isValid()) {
      this.updateTaiKhoan();
    }
  }

  popupUserVisibleChange($event: boolean) {
    console.log($event);
  }

  addTaiKhoan() {
    this.newUser.roles = [];
    this.generalService.addTaikhoan(this.newUser).subscribe(res => {
      if (res.ret && res.ret[0].code !== 0) {
        this.notificationService.showNotification(Constant.ERROR, res.ret[0].message);
        this.newUser.id = 0;
      } else {
        this.getListData();
        this.isUserPopupOpened = false;
        this.notificationService.showNotification(Constant.SUCCESS, Constant.MESSAGE_ADD_SUCCESS);
      }
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, error.errors[0].message);
    });
  }

  updateTaiKhoan() {
    this.generalService.updateTaikhoan(this.newUser).subscribe(res => {
      if (res.ret && res.ret[0].code !== 0) {
        this.notificationService.showNotification(Constant.ERROR, res.ret[0].message);
      } else {
        this.getListData();
        this.isEditUserPopupOpened = false;
        this.notificationService.showNotification(Constant.SUCCESS, Constant.MESSAGE_UPDATE_SUCCESS);
      }
    }, error => {

    });
  }
  generateUsername(fullName: string): string {
    if (!fullName) return '';
    const names = fullName.trim().split(' ');
    const lastName = names[names.length - 1].toLowerCase();
    const initials = names.slice(0, -1).map(name => name.charAt(0).toLowerCase()).join('');
    return lastName + initials;
  }
  changeFullname($event: any) {
    this.newUser.username = this.service.removeVietnameseTones(this.generateUsername($event));
  }
}
