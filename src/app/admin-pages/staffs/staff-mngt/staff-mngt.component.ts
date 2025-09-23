import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {DxValidationGroupComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import {forkJoin} from 'rxjs';
import {ExportingEvent} from "devextreme/ui/data_grid";
import {Workbook} from "exceljs";
import {exportDataGrid as exportDataGridToXLSX} from "devextreme/excel_exporter";
import {saveAs} from 'file-saver-es';
import {FullNamePipe} from "../../../pipes/full-name.pipe";
import {DxFileUploaderComponent} from "devextreme-angular";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";

@Component({
  selector: 'app-staff-mngt',
  templateUrl: './staff-mngt.component.html',
  styleUrls: ['./staff-mngt.component.scss']
})
export class StaffMngtComponent implements OnInit {
  isShowEdit = false;
  datas = [];
  dataItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  gradeSource = [];
  subjectSource = [];
  classSource = [];
  filterClassSource = [];
  arrImg = [];
  filterClassId: any;
  studentCount: 0;
  isAdmin = false;
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel', // Xuất tất cả dữ liệu
    exportSelectedRows: 'Export selected rows to Excel', // Xuất các dòng đã chọn
    exportTo: 'Export data', // Tiêu đề tổng
  };
  user: any;
  currentFilter: any;
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  previewVisible = false;
  previewImage: any = '';

  @ViewChild("fileUploader", {static: false}) fileUploader: DxFileUploaderComponent;

  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private fullNamePipe: FullNamePipe,
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
    this.user = user;
    this.isAdmin = user.data.role === 2;
    //console.log(user);
    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListSubjectByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassBySchool(user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource, classSource, schoolClassSource]) => {
      this.subjectSource = subjectSource;
      this.classSource = (user.data.role === 2 || user.data.isBGH) ? schoolClassSource : classSource;
      let filterGradeIds = classSource.map(en => en.grade);
      //console.log(this.classSource, filterGradeIds);
      if (user.data.role === 2 || user.data.isBGH) {
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
    this.generalService.getListTeacherBySchool(this.user.data.schoolId).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.studentCount = res.length;
      this.datas.forEach(en => {
        en.stt = index++;
        en.className = this.classSource.find(x => x.id === en.classId)?.name;
        en.hasLearned = en.hasLearned ? '✔' : '';
        en.isNotUsingLMSText = en.isNotUsingLMS ? '✔' : '';

        en.fullName = this.fullNamePipe.transform(en);
        en.phoneNo = this.getPhoneStudent(en);
        if (en.signUrl && !en.signUrl.includes('http')){
          en.signUrl = `https://mschool.edu.vn/${en.signUrl}`;
        }
      });
    }, error => {
    });
  }

  closePopupEdit() {
    this.isShowEdit = false;
  }

  gradeChange($event: any) {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = this.classSource.filter(en => 1 === 1);
    }
    this.filterClassId = this.filterClassSource[0].id;
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


  onExporting(e: ExportingEvent) {
    /*const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');*/
    let cls = this.classSource.find(en => en.id === this.filterClassId);
    let clsName = cls.name.toUpperCase();
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('DsHocSinh');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], {type: 'application/octet-stream'}), `DS_HOCSINH_LOP_${clsName}.xlsx`);
      });
    });
    e.cancel = true;
  }

  changeUsingServiceLMS(data: any, $event) {
    let payload = {
      studentId: data.id,
      status: $event
    }
    this.generalService.updateStudentStatus(payload).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật trạng thái thành công');
      this.loadGrid();
    }, error => {

    });
  }

  changeUsingServiceMS(data: any, $event) {
    let payload = {
      studentId: data.id,
      status: $event
    }
    this.generalService.updateStudentStatusMS(payload).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật trạng thái thành công');
      this.loadGrid();
    }, error => {

    });
  }
  onUploadTaiLieuStarted(e: any) {
    console.log('Upload started:', e);
    const item = e.file;
    const fileName = item.name;
    const parts = fileName.split('.');
    let fileExt = parts.length > 1 ? parts.pop() : '';
    return false;
  }

  onTaiLieuUploaded(e: any, data: any) {
    console.log(data);
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      data.signUrl = res.url;
      this.fileUploader.showFileList = false;

    }
    // Thực hiện các hành động tùy chỉnh khi upload hoàn tất
  }

  onTaiLieuUploadError(e: any) {
    console.error('Upload error:', e);
    // Thực hiện các hành động tùy chỉnh khi upload gặp lỗi
  }
  onFileSelected(e: any) {
    const file = e.value?.[0];

    if (file && file.size > 500000) {
      alert('❌ File vượt quá 500KB, vui lòng chọn file nhỏ hơn!');
      e.component.reset(); // Xoá file khỏi uploader
    }
  }
  onSaveClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    console.log(this.dataItem);
    this.generalService.saveStaff(this.dataItem).subscribe(en => {
      if (en.code === 0) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Lưu cấu hình thành công');
        this.loadGrid();
      } else {
        //this.notificationService.showNotification(Constant.ERROR, 'Ký số không thành công. Kiểm tra lại thông tin ký số');
      }
    }, error => {

    });

  };

  openPreview(data) {
    this.previewVisible = true;
    this.previewImage = data.signUrl;
  }
}
