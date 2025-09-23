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
@Component({
  selector: 'app-student-result-score',
  templateUrl: './student-result-score.component.html',
  styleUrls: ['./student-result-score.component.scss']
})
export class StudentResultScoreComponent implements OnInit {
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
  multipleApproved = false;

  filterGrade: 0;
  filterStatus: -1;
  filterClassIds = [];
  filterClassId: any;
  studentCount: 0;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.dataItem = {
      imageUrls: [],
      files: []
    };
    this.editTitle = 'Thêm mới bài tập';
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.arrImg = [];
    for (let i = 1; i <= 15; i++) {
      this.arrImg.push(`https://mschool.edu.vn/media/lms/${i}.png`);
    }

  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    const user = await this.authService.getUser();
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
      if (user.data.role === 2 || user.data.isBGH){
        this.gradeSource = gradeSource.filter(en => 1 === 1);
      } else {
        this.gradeSource = gradeSource.filter(en => filterGradeIds.includes(en));
      }
      this.filterClassSource = this.classSource.filter(en => 1 === 1);
      this.filterClassId = this.filterClassSource[0].id;
      this.loadGrid();
      this.gradeSource.unshift('Tất cả');
    });
  }

  async loadGrid() {
    this.generalService.getListStudentByClass(this.filterClassId).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.studentCount = res.length;
      this.datas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }

  addItemClick() {
    this.isShowEdit = true;
    this.editTitle = 'Thêm mới bài tập';
    this.dataItem = {
      imageUrls: [],
      files: []
    };
  }

  onEditClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    this.isShowEdit = true;
    this.editTitle = 'Sửa thông tin bài tập';
  };

  complineUrlSource(url) {
    if (url.indexOf('http') === -1) {
      url = this.configService.getConfig().api.mSchoolUrl + '' + url;
    }
    return url;
  }

  async onSaveClick() {
    if (this.isValid()) {
      if (this.dataItem.id) {
        this.saveHomeWork(true);
      } else {
        this.saveHomeWork(false);
      }
    } else {
      this.notificationService.showNotification(Constant.WARNING, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  saveHomeWork(isEdit) {
    if (!isEdit) {
      delete this.dataItem.id;
    }
    this.generalService.saveHomework(this.dataItem).subscribe(res => {
      this.isShowEdit = false;
      this.notificationService.showNotification(Constant.SUCCESS, isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công');
      this.loadGrid();
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
    });
  }

  closePopupEdit() {
    this.isShowEdit = false;
  }

  /*handle upload*/
  onUploadStarted(e: any) {

  }

  onImageUploaded(e: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      this.dataItem.imageUrls.push(res.url);
    }
    // Thực hiện các hành động tùy chỉnh khi upload hoàn tất
  }

  onFileUploaded(e: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      alert('vao day');
      let obj = {
        filename: this.service.getFileName(res.url),
        source: res.url
      }
      this.dataItem.files.push(obj);
      console.log(this.dataItem);
    }
    // Thực hiện các hành động tùy chỉnh khi upload hoàn tất
  }

  onUploadError(e: any) {
    console.error('Upload error:', e);
    // Thực hiện các hành động tùy chỉnh khi upload gặp lỗi
  }

  toDisplaySettingMessage() {
    return '';
  }

  onDeleteClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    let data = e.row.data;
    const result = confirm(`Bạn có chắc chắn muốn xóa bài tập: <strong>${data.title}</strong> này?`, 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.deleteHomework(data.id).subscribe(en => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Xóa dữ liệu thành công');
          this.loadGrid();
        }, error => {

        });
      }
    });
  };

  viewDsBaiGiang(id: string, name: string) {
    //this.router.navigate(['/teacher/teacher-course', id, name]);
  }

  showUploadForm(data: any) {

  }

  doApproveMutiple() {

  }

  statusChange($event: any) {
    /* console.log($event);
     this.filterStatus = $event.itemData.status;
     this.loadGrid();*/
  }

  gradeChange($event: any) {
    /*console.log($event);
    this.filterGrade = $event.itemData;
    this.loadGrid();*/
    console.log($event);
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else{
      this.filterClassSource = this.classSource.filter(en => 1 === 1);
    }
    this.filterClassId = this.filterClassSource[0].id;
  }

  deleteImage(url: any) {
    this.dataItem.imageUrls = this.dataItem.imageUrls.filter(en => en !== url);
  }

  deleteFile(item: any) {
    this.dataItem.files = this.dataItem.files.filter(en => en.filename !== item.filename);
  }

  classChange($event) {
    this.filterClassId = $event.itemData.id;
    this.loadGrid();
  }
  getPhoneStudent(data){
    if (data.contacts){
      let contact = data.contacts.find(en => en.mainContact);
      if (contact) return contact.value;
    }
    return '';
  }
}
