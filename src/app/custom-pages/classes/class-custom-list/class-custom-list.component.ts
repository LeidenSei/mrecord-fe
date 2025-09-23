import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DxValidationGroupComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {forkJoin} from 'rxjs';
import {confirm} from "devextreme/ui/dialog";
import {FullNamePipe} from "../../../pipes/full-name.pipe";

@Component({
  selector: 'app-class-custom-list',
  templateUrl: './class-custom-list.component.html',
  styleUrls: ['./class-custom-list.component.scss']
})
export class ClassCustomListComponent implements OnInit {
  isShowEdit = false;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  gradeSource = [];
  gradeSource4Select = [];
  subjectSource = [];
  classSource = [];

  filterGrade: 0;
  isAdmin = false;
  schoolId: any;
  isShowSaveStudent = false;
  isShowStudent = false;
  excelStudent: any;
  studentSource: any[];
  studentListTitle: any;
  selectedClassName: any;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;


  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private fullNamePice: FullNamePipe,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.dataItem = {
      imageUrls: [],
      files: []
    };
    this.editTitle = 'Thêm mới lớp';
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.excelStudent = '';
  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.schoolId = user.data.schoolId;
    this.isAdmin = user.data.role === 2;
    console.log(user);
    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListSubjectByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassBySchool(user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource, classSource, schoolClassSource]) => {
      this.subjectSource = subjectSource;
      this.classSource = (user.data.role === 2 || user.data.isBGH) ? schoolClassSource : classSource;
      let filterGradeIds = classSource.map(en => en.grade);
      console.log(this.classSource, filterGradeIds);
      if (user.data.role === 2 || user.data.isBGH) {
        this.gradeSource = gradeSource.filter(en => 1 === 1);
      }
      this.gradeSource4Select = this.gradeSource.map(en => {
        return {value: en, label: `Khối ${en}`};
      });
      console.log('this.gradeSource4Select', this.gradeSource4Select);
      this.loadGrid();
      this.gradeSource.unshift('Tất cả');
      this.gradeSource4Select.unshift({value: 0, label: 'Tất cả'});
    });
  }

  async loadGrid() {
    this.generalService.getListClassCustomBySchool(this.schoolId).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.datas.forEach(en => {
        en.stt = index++;
        en.gradeLabel = en.grade === 0 ? '' : en.grade
      });
    }, error => {
    });
  }
  loadStudentClass(){
    this.generalService.getClassCustomStudent(this.dataItem.id).subscribe(res => {
      this.studentSource = res;
      let index = 1;
      this.studentSource.forEach(en => {
        en.stt = index++;
        en.fullName = this.fullNamePice.transform(en)
      });
    }, error => {
    });
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
    this.filterGrade = $event;
  }

  getPhoneStudent(data) {
    if (data.contacts) {
      let contact = data.contacts.find(en => en.mainContact);
      if (contact) return contact.value;
    }
    return '';
  }

  onViewEdit = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.editTitle = 'Sửa thông tin lớp';
    this.dataItem = Object.assign({}, e.row.data);
    console.log(this.dataItem);
    this.isShowEdit = true;
  };
  onViewStudentList = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    console.log(this.dataItem);
    this.isShowStudent = true;
    this.studentListTitle = `Danh sách học sinh lớp: ${this.dataItem.name}`;
    this.loadStudentClass();
  };
  onAddStudentPopup = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    this.isShowSaveStudent = true;
    this.excelStudent = '';
    this.selectedClassName = this.dataItem.name;
  };

  addItemClick() {
    this.validationGroup.instance.reset();
    this.isShowEdit = true;
    this.editTitle = 'Thêm mới lớp';
    this.dataItem = {};
  }

  async onSaveClick() {
    console.log(this.dataItem);
    if (this.isValid()) {
      if (this.dataItem.id) {
        this.saveUpdate();
      } else {
        this.saveAdd();
      }
    } else {
      this.notificationService.showNotification(Constant.ERROR, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }

  saveAdd() {
    this.generalService.addClassCustom(this.dataItem).subscribe(res => {
      console.log(res);
      this.isShowEdit = false;
      this.notificationService.showNotification(Constant.SUCCESS, 'Thêm mới lớp học thành công');
      this.loadGrid();
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Thêm mới lớp học thất bại: ' + error);
    });
  }

  saveUpdate() {
    this.generalService.updateClassCustom(this.dataItem).subscribe(res => {
      if (res) {
        this.isShowEdit = false;
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật lớp học thành công');
        this.loadGrid();
      }
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật lớp học thất bại: ' + error);
    });
  }

  onSaveStudent() {
    this.generalService.addStudents2CustomClass({
      id: this.dataItem.id, body: this.excelStudent
    }).subscribe(res => {
      if (res) {
        if (res.errorClass.length){
          this.notificationService.showNotification(Constant.ERROR, `${res.errorClass.join(', ')} không tồn tại`);
          this.loadGrid();
          return;
        }
        if (res.errorStudents.length){
          this.notificationService.showNotification(Constant.ERROR, `${res.errorStudents.join(', ')} không tồn tại`);
          this.loadGrid();
          return;
        }
        if (res.success > 0) {
          this.isShowSaveStudent = false;
          this.notificationService.showNotification(Constant.SUCCESS, `Cập nhật học sinh thành công ${res.success} học sinh`);
          this.loadGrid();
        } else {
          this.notificationService.showNotification(Constant.WARNING, `Không có học sinh nào được thêm vào lớp thành công`);
        }
      }
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật học sinh thất bại: ' + error);
    });
  }
  onDeleteClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    let data = e.row.data;
    const result = confirm(`Bạn có chắc chắn muốn xóa lớp: <strong>${data.name}</strong> này?`, 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.deleteClassCustom(data.id).subscribe(en => {
          if (en.code > 0){
            this.notificationService.showNotification(Constant.WARNING, en.message);
          } else {
            this.notificationService.showNotification(Constant.SUCCESS, 'Xóa lớp thành công');
            this.loadGrid();
          }
        }, error => {

        });
      }
    });
  };
}
