import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {DxFileUploaderComponent, DxValidationGroupComponent} from "devextreme-angular";
import {Constant} from "../../../shared/constants/constant.class";
import {forkJoin} from 'rxjs';
import form from "devextreme/ui/form";
import {HttpHeaders} from "@angular/common/http";
import {AppConfigService} from "../../../app-config.service";
import {confirm} from "devextreme/ui/dialog";
import DevExpress from "devextreme";
import custom = DevExpress.ui.dialog.custom;
import CustomStore from "devextreme/data/custom_store";
import {LoadOptions} from "devextreme/data";
import {lastValueFrom} from 'rxjs';
import {Workbook} from "exceljs";
import {saveAs} from 'file-saver-es';

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

@Component({
  selector: 'app-teacher-homework',
  templateUrl: './teacher-homework.component.html',
  styleUrls: ['./teacher-homework.component.scss']
})
export class TeacherHomeworkComponent implements OnInit {
  isShowEdit = false;
  getSizeQualifier = getSizeQualifier;
  datas = [];
  dataItem: any;
  taiLieuItem: any;
  isSaveDisabled: any;
  editTitle: any;
  uploadHeaders: any;
  gradeSource = [];
  subjectSource = [];
  classSource = [];
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
  user: any;
  filterSubjectItems = [];
  filterSubjectId: any;
  dataSource: any;

  tabSource = [];
  isShowResult = false;
  tabClassSource = [];
  tabClassId: any;
  tabClassIndex: number;
  studentResults = [];
  selectedResult: any;
  isShowImageEditor = false;
  editorImagePath: string = '';
  readonly allowedPageSizes = this.service.getAllowPageSizes();

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
    this.tabClassIndex = 0;
    this.selectedResult = {
      result: null
    };
  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {

    this.user = await this.authService.getUser();
    const user = this.user;
    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListSubjectByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassBySchool(user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource, schoolSubjectSource, classSource, schoolClassSource]) => {
      this.gradeSource = gradeSource;
      this.subjectSource = subjectSource;
      this.classSource = user.data.role === 2 ? schoolClassSource : classSource;

      this.filterSubjectItems = subjectSource.map(en => {
        return {text: en.name, id: en.id}
      });
      this.filterSubjectItems.unshift({text: 'Tất cả', id: ''});
      this.loadGrid();

      if (this.subjectSource.length === 0) {
        this.subjectSource = schoolSubjectSource;
      }
    });
  }

  async loadGrid() {
    const authService = this.authService;
    const generalService = this.generalService;
    const filterSubjectId = this.filterSubjectId;
    const filterClassIds = this.filterClassIds;
    this.dataSource = new CustomStore({
      async load(loadOptions: LoadOptions) {
        try {
          const user = await authService.getUser();
          let subjectId = filterSubjectId;
          //console.log(subjectId)
          let payload = {
            pageNumber: (loadOptions.skip / loadOptions.take) + 1,
            pageSize: loadOptions.take,

            subjectId: subjectId,
            schoolId: user.data.schoolId,
            classIds: filterClassIds,
            teacherId: user.data.id,
          };
          if (user.data.role === 2) {
            delete payload.teacherId;
          }
          if (!this.filterSubjectId) {
            delete payload.subjectId;
          }
          let result = await lastValueFrom(generalService.getGetListHomework(payload));
          let index = 1;
          // @ts-ignore
          result.forEach(en => {
            en.stt = loadOptions.skip + index++;
          });

          return {
            // @ts-ignore
            data: result,
            // @ts-ignore
            totalCount: result.length ? result[0].totalCount : 0,
            /*summary: 10000,
            groupCount: 10,*/
          };
        } catch (err) {
          console.log(err);
        }
      }
    })
  }

  addItemClick() {
    this.validationGroup.instance.reset();
    this.isShowEdit = true;
    this.editTitle = 'Thêm mới bài tập';
    this.dataItem = {
      createById: this.user.data.id,
      schoolId: this.user.data.schoolId,
      createByUserType: this.user.data.role,
      createBy: this.user.data.fullname,
      imageUrls: [],
      files: []
    };
  }

  onEditClick = (data: any) => {
    console.log(data);
    this.dataItem = Object.assign({}, data);
    this.isShowEdit = true;
    this.editTitle = 'Sửa thông tin bài tập';
  };

  combineUrlSource(url) {
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

  getListResultByClass() {
    this.generalService.getListHomeworkResultByClass(this.dataItem.id, this.tabClassId).subscribe(res => {
      this.studentResults = res;
    }, error => {
    });
  }

  closePopupEdit() {
    this.isShowEdit = false;
  }

  closePopupResult() {
    this.isShowResult = false;
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

  onDeleteClick = (data: any) => {
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
  }

  deleteImage(url: any) {
    this.dataItem.imageUrls = this.dataItem.imageUrls.filter(en => en !== url);
  }

  deleteFile(item: any) {
    this.dataItem.files = this.dataItem.files.filter(en => en.filename !== item.filename);
  }

  doFilterClass($event) {
    this.loadGrid();
  }

  tabSubjectChange($event) {
    this.filterSubjectId = $event.itemData.id;
    this.loadGrid();
  }

  showResultForm(data: any) {
    this.tabClassSource = [];
    this.selectedResult = {};
    this.isShowResult = true;
    let item = data;
    this.dataItem = Object.assign({}, data);
    this.editTitle = 'Thông tin bài tập';
    this.tabSource = [];

    this.dataItem.files.forEach(en => {
      this.tabSource.push({
        icon: this.service.getFileExt(en.source) + 'file',
        ext: this.service.getFileExt(en.source),
        title: this.service.getFileName(en.source),
        source: en.source,
      });
    });
    this.dataItem.imageUrls.forEach(en => {
      this.tabSource.push({
        icon: 'image',
        ext: this.service.getFileExt(en),
        title: this.service.getFileName(en),
        source: en,
      });
    });

    const classTabs = this.classSource.filter(en => item.classIds.includes(en.id));
    this.tabClassSource = classTabs.map(en => {
      return {
        icon: 'image',
        id: en.id,
        text: en.name,
      }
    });
    this.tabClassId = classTabs[0].id;
    setTimeout(() => this.tabClassIndex = 0, 0);
    this.getListResultByClass();
  }

  tabClassChange($event) {
    console.log($event);
    this.tabClassId = $event.itemData.id;
    this.getListResultByClass();
  }

  toIconResult(item: any) {
    if (item.hasResult && (item.result.mark || item.result.reviewMark)) {
      return 'dx-icon-check';
    } else if (item.hasResult) {
      return 'dx-icon-edit';
    } else {
      return 'dx-icon-remove';
    }
  }

  toColorResult(item: any) {
    if (item.hasResult && (item.result.mark || item.result.reviewMark)) {
      return 'success';
    } else if (item.hasResult) {
      return 'primary';
    } else return 'danger';
  }

  itemStudentResultChange($event) {
    console.log($event.itemData);
    this.selectedResult = Object.assign({}, $event.itemData);
  }

  doMarking() {
    /*if (!this.selectedResult.result.mark){
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập số điểm trước khi cập nhật');
      return;
    }*/
    this.generalService.teacherMarking(this.selectedResult.result).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Chấm bài thành công');
      this.loadGrid();
    }, error => {

    });
  }

  typeOfMedia(path) {
    let ext = this.service.getFileExt(path);
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'svg', 'webp'];
    if (imageExtensions.includes(ext)) return 'image';
    if (videoExtensions.includes(ext)) return 'video';
    return 'document';
  }

  openImageEditor(path) {
    this.isShowImageEditor = true;
    this.editorImagePath = path;
  }

  onSave(event: any) {
    console.log('Saved image:', event.dest);
    this.isShowImageEditor = false;
  }

  onCancel() {
    this.isShowImageEditor = false;
  }

  handleLoad($event: any) {

  }

  handleProcess($event) {
    console.log($event);
  }

  exportToExcel() {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Kết quả');
    worksheet.getRow(1).font = {bold: true, color: {argb: '00000000'}};
    // Thêm tiêu đề cột
    worksheet.columns = [
      {header: 'Học sinh', key: 'studentName', width: 30},
      {header: 'Điểm', key: 'mark', width: 30},
      {header: 'Nhận xét', key: 'reviewMark', width: 30},
    ];

    // Thêm dữ liệu từ listData
    this.studentResults.forEach((item) => {
      let newItem = {studentName: item.studentName, mark: item.result?.mark, reviewMark: item.result?.reviewMark}
      worksheet.addRow(newItem);
    });

    // Xuất file Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      saveAs(blob, `KQ_${this.dataItem.title.toUpperCase()}.xlsx`);
    });
  }

  linkToStatisticsPage() {
    this.router.navigate(['/common/thong-ke-hoan-thanh-btvn']);
  }
}
