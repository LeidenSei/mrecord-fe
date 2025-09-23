import {ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
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

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

@Component({
  selector: 'app-student-homework',
  templateUrl: './student-homework.component.html',
  styleUrls: ['./student-homework.component.scss']
})
export class StudentHomeworkComponent implements OnInit {
  isShowEdit = false;
  isShowResult = false;
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
  filterStatusItems = [
    {text: 'Tất cả', id: '-1'},
    {text: 'Chưa làm bài', id: 0},
    {text: 'Đã làm bài', id: 1},
    {text: 'Đã có điểm', id: 2}
  ];
  filterSubjectId: any;
  dataSource: any;
  readonly allowedPageSizes = this.service.getAllowPageSizes();
  tabSource = [];
  resultItem: any;
  resultImages = [];
  files = [];
  isMobileScreen: boolean;
  public screenWidth: number;
  isSubmitLoading = false;
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
    this.resultItem = {
      imageUrls: []
    };
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
    this.screenWidth = window.innerWidth;
    this.user = await this.authService.getUser();
    const user = this.user;
    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListSubjectBySchool(user.data.schoolId),
      this.generalService.getListClassBySchool(user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource, classSource]) => {
      this.gradeSource = gradeSource;
      this.subjectSource = subjectSource;
      this.filterSubjectItems = subjectSource.filter(en => 1 === 1);
      this.filterSubjectItems.unshift({name: 'Tất cả', id: ''});
      this.filterSubjectId = '';
      this.loadGrid();
    });
    this.isMobileScreen = window.innerWidth <= 600;
    window.onresize = () => {
      this.isMobileScreen = window.innerWidth <= 600;
    };
  }

  async loadGrid() {
    const authService = this.authService;
    const generalService = this.generalService;
    const filterSubjectId = this.filterSubjectId;
    const filterClassIds = this.filterClassIds;
    const filterStatus = this.filterStatus;

    this.dataSource = new CustomStore({
      async load(loadOptions: LoadOptions) {
        //console.log('loadOptions', loadOptions);
        try {
          const user = await authService.getUser();
          //console.log(subjectId)
          let payload = {
            pageNumber: (loadOptions.skip / loadOptions.take) + 1,
            pageSize: loadOptions.take,
            subjectId: filterSubjectId,
            schoolId: user.data.schoolId,
            classIds: filterClassIds,
            studentId: user.data.studentId,
            status: filterStatus
          };
          if (!filterSubjectId) {
            delete payload.subjectId;
          }

          let result = await lastValueFrom(generalService.getStudentHomework(payload));
          let index = 1;
          // @ts-ignore

          let retResult = filterStatus >= 0 ? result.filter(en => en.resultType === filterStatus) : result;
          retResult.forEach(en => {
            en.stt = loadOptions.skip + index++;
          });
          return {
            // @ts-ignore
            data: retResult,
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

  /*async loadGrid() {
    const user = await this.authService.getUser();
    let subjectId = (user.data.toTruongMon && user.data.toTruongMon.length) ? user.data.toTruongMon[0] : '0';
    let payload = {
      schoolId: user.data.schoolId,
      classIds: this.filterClassIds,
      subjectId: "",
      teacherId: user.data.id,
      take: 200,
      skip: 0,
      page: 1,
      pageSize: 200
    };
    if (user.data.role === 2) {
      delete payload.teacherId;
    }
    if (this.filterSubjectId){
      payload.subjectId = this.filterSubjectId;
    }
    /!*if (this.filterGrade > 0)
      payload.grade = this.filterGrade;
    else
      delete payload.grade;

    if (this.filterStatus > -1)
      payload.trangThai = this.filterStatus
    else
      delete payload.trangThai;*!/

    this.generalService.getGetListHomework(payload).subscribe(res => {
      this.datas = res;
      let index = 1;
      this.datas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }*/

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Cập nhật kích thước màn hình khi thay đổi kích thước cửa sổ
    this.screenWidth = window.innerWidth;
  }
  isSmallScreen(): boolean {
    return this.screenWidth < 430;
  }
  onEditClick = (data: any) => {
    this.isSubmitLoading = false;
    let item = data;
    this.dataItem = Object.assign({}, data);
    this.isShowEdit = true;
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
    //console.log(this.tabSource);

    if (item.result) {
      this.resultItem = item.result;
      this.resultImages = item.result.imageUrls;
      this.files = item.result.files;
    } else {
      this.resultItem = {
        id: '',
        content: '',
        imageUrls: [],
        files: [],
        studentId: '',
        homeworkId: item.id,
        isSubmit: true,
        mark: '',
        reviewMark: ''
      };

    }

    /*this.tabSource = item.images.map(en => {
      return {
        icon: this.service.getFileExt(en) + 'file',
        ext: this.service.getFileExt(en),
        title: this.service.getFileName(en),
        source: en,
        source2: this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + en)
      };
    });*/
  };

  onViewResultClick = (data: any) => {
    console.log(data);
    let item = data;
    this.dataItem = Object.assign({}, data);
    this.isShowResult = true;
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
    //console.log(this.tabSource);

    if (item.result) {
      this.resultItem = item.result;
      this.resultImages = item.result.imageUrls;
    }
  };

  combineUrlSource(url) {
    if (url.indexOf('http') === -1) {
      url = this.configService.getConfig().api.mSchoolUrl + '' + url;
    }
    return url;
  }

  isImage(path) {
    let ext = this.service.getFileExt(path);
    return ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp';
  }

  async onSaveClick() {
    if (this.isValid()) {

      if (this.resultItem.id) {
        this.saveResult(true);
      } else {
        this.saveResult(false);
      }
    } else {
      this.notificationService.showNotification(Constant.WARNING, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  saveResult(isEdit) {
    if (!this.resultItem.content) {
      this.notificationService.showNotification(Constant.WARNING, 'Bạn chưa nhập đáp án');
      return;
    }
    this.resultItem.schoolId = this.user.data.schoolId;
    this.resultItem.studentId = this.user.data.studentId;
    this.resultItem.studentName = this.user.data.fullname;
    this.resultItem.isSubmit = true;
    this.resultItem.imageUrls = this.resultImages;
    this.resultItem.files = this.files;
    this.resultItem.homeworkId = this.dataItem.id;
    if (!isEdit) //lưu mới
    {
      delete this.resultItem.id;
    }
    this.isSubmitLoading = true;
    this.generalService.saveHomeworkResult(this.resultItem).subscribe(res => {
      this.isSubmitLoading = false;
      if (res.isValid) {
        this.isShowEdit = false;
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật kết quả thành công');
        this.loadGrid();
      } else {
        this.notificationService.showNotification(Constant.ERROR, res.errors[0].errorMessage);
      }
    }, error => {
      this.isSubmitLoading = false;
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
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
  closePopupEdit() {
    this.isShowEdit = false;
  }
  closePopupViewKQ() {
    this.isShowResult = false;
  }
  /*handle upload*/
  onUploadStarted(e: any) {

  }

  onImageUploaded(e: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      if (this.service.isImageFile(res.url))
        this.resultImages.push(res.url);
      else{
        const fileName = this.service.getFileName(res.url);
        const fileSource = res.url;
        console.log(fileName, fileSource);
        this.files.push({filename: fileName, source: fileSource});
      }

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
  }

  deleteImage(url: any) {
    this.resultImages = this.resultImages.filter(en => en !== url);
  }

  deleteFile(item: any) {
    this.files = this.files.filter(en => en.filename !== item.filename);
  }

  doFilterClass($event) {
    this.loadGrid();
  }

  tabStatusChange($event) {
    this.filterStatus = $event.itemData.id;
    this.loadGrid();
  }

  subjectChange($event) {
    this.filterSubjectId = $event.itemData.id;
    this.loadGrid();
  }
}
