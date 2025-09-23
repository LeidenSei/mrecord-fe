import {ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from '../../../services';
import {GeneralService} from '../../../services/general.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationService} from '../../../services/notification.service';
import {DxDataGridTypes} from 'devextreme-angular/ui/data-grid';
import {DxFileUploaderComponent, DxValidationGroupComponent} from 'devextreme-angular';
import {Constant} from '../../../shared/constants/constant.class';
import {forkJoin} from 'rxjs';
import {AppConfigService} from '../../../app-config.service';
import {confirm, custom} from 'devextreme/ui/dialog';
import {DomSanitizer} from "@angular/platform-browser";
import {ExportingEvent} from "devextreme/ui/data_grid";
import {Workbook} from "exceljs";
import {saveAs} from 'file-saver-es';
import {exportDataGrid as exportDataGridToXLSX} from "devextreme/excel_exporter";

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

@Component({
  selector: 'app-teacher-exam-paper',
  templateUrl: './teacher-exam-paper.component.html',
  styleUrls: ['./teacher-exam-paper.component.scss']
})
export class TeacherExamPaperComponent implements OnInit {
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
  answerTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'O', 'P', 'Q'];
  user: any;
  popupResultTitle: any;
  isShowPopupResult = false;
  isShowPreview = false;
  resultInfo: any;
  timeIntervalFrame: any;
  sumMark = 10;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;
  tabSource = [];
  isPopupPreview = false;
  docLoading = false;
  selectedTabIndex = 1;
  isShowResult = false;

  examPaperData: any;
  popupResultStudentTitle: any;
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel', // Xuất tất cả dữ liệu
    exportSelectedRows: 'Export selected rows to Excel', // Xuất các dòng đã chọn
    exportTo: 'Export data', // Tiêu đề tổng
  };
  public screenWidth: number;

  classTabIndex = 0;
  tabClassSource: any[] = [];
  filterClassName = '';
  studentResult: any[] = [];
  studentClassResult: any[] = [];

  allClasses: any[] = [];
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              public sanitizer: DomSanitizer,
              private ref: ChangeDetectorRef) {
    this.dataItem = {
      timeToDo: 1,
      time: 60,
      questions: [],
      isAntiCheating: false
    };
    this.editTitle = 'Thêm mới đề thi';
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.isSaveDisabled = true;
    this.resultInfo = {
      items: [],
      resultCount: 0,
      studentCount: 0,
    }
  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Cập nhật kích thước màn hình khi thay đổi kích thước cửa sổ
    this.screenWidth = window.innerWidth;
  }

  async ngOnInit() {
    this.user = await this.authService.getUser();
    forkJoin([
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectByTeacher(this.user.data.schoolId, this.user.data.personId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId),
      this.generalService.getListClassByTeacher(this.user.data.schoolId, this.user.data.personId),

      this.generalService.getListClassBySchool(this.user.data.schoolId),
    ]).subscribe(([gradeSource, subjectSource, schoolSubjectSource, classSource, schoolClassSource]) => {
      this.gradeSource = gradeSource;
      this.subjectSource = this.user.data.role === 2 ? schoolSubjectSource : subjectSource;
      this.classSource = this.user.data.role === 2 ? schoolClassSource : classSource;
      this.allClasses = schoolClassSource;
      console.log('this.classSource', this.classSource);
      this.loadGrid();
    });
  }

  async loadGrid() {
    const user = await this.authService.getUser();
    //let subjectId = (user.data.toTruongMon && user.data.toTruongMon.length) ? user.data.toTruongMon[0] : '0';
    let payload = {
      schoolId: user.data.schoolId,
      'classIds': this.filterClassIds,
      userId: user.data.id,
      'take': 200,
      'skip': 0,
      'page': 1,
      'pageSize': 200
    };
    if (user.data.role === 2) {
      delete payload.userId;
    }
    this.generalService.getListExamPaper(payload).subscribe(res => {
      this.datas = res;
      let index = 1;

      this.datas.forEach(en => {
        en.stt = index++;
        en.files = [];
        en.images.forEach(fileItem => {
          en.files.push({
            filename: this.service.getFileName(fileItem),
            source: fileItem
          });
        });
        en.numberQuestion = en.questions.length;
        en.numberOfAnswer = en.questions[0].numberOfAnswer;


      });
    }, error => {
    });
  }

  addItemClick() {
    this.tabSource = [];
    this.isShowEdit = true;
    this.editTitle = 'Thông tin đề thi';
    this.dataItem = {
      questions: [],
      time: 60,
      timeToDo: 1,
      files: [],
      schoolId: this.user.data.schoolId,
      userType: this.user.data.role,
      createUserId: this.user.data.id,
      isAntiCheating: false
    };
    if (this.validationGroup) {
      this.validationGroup.instance.reset();
    }
  }

  onEditClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.dataItem = Object.assign({}, e.row.data);
    console.log(this.dataItem);
    if (!this.dataItem.classIds) {
      this.dataItem.classIds = [this.dataItem.classId];
    }

    this.editTitle = 'Sửa thông tin đề thi';
    this.syncQuestion();
    this.isShowEdit = true;


    this.tabSource = this.dataItem.images.map(en => {
      return {
        icon: this.service.getFileExt(en) + 'file',
        ext: this.service.getFileExt(en),
        title: this.service.getFileName(en),
        source: en,
      };
    });

    if (this.tabSource.length) {
      let checkDocumentFile = this.service.typeOfMedia(this.tabSource[0].source) === 'document';
      if (checkDocumentFile) {
        setTimeout(() => this.docLoading = true, 500);
      }
    }
    //GetResult
    let payload = {
      id: this.dataItem.id,
      schoolId: this.dataItem.schoolId
    };
    this.generalService.getExamPaperResult(payload).subscribe(res => {
      this.dataItem.hasResult = res.studentCount > 0;
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
    });
    console.log(this.tabSource);
  };

  private syncQuestion() {
    //Question
    let questionSTT = 1;
    this.dataItem.questions.forEach(q => {
      q.index = questionSTT;
      q.answers = [];
      for (let j = 0; j < q.numberOfAnswer; j++) {
        q.answers.push({index: j + 1, checked: q.rightAnswers.includes(j + 1), name: this.answerTitle[j]});
      }
      questionSTT++;
    });
    console.log(this.dataItem.questions);
  }

  combineUrlSource(url) {
    if (url.indexOf('http') === -1) {
      url = this.configService.getConfig().api.mSchoolUrl + `/Media/ExamPapers/${this.user.data.schoolId}/` + url;
    }
    return url;
  }

  async onSaveClick() {
    if (this.isValid()) {
      if (this.dataItem.id) {

        if (this.dataItem.hasResult) {
          let myDialog = custom({
            title: "Thông báo",
            messageHtml: `<div style="font-size: 20px">Đã có kết quả làm bài của học sinh. Bạn có chắc chắn muốn cập nhật lại đề thi không?</div>`,
            buttons: [{
              text: "Lưu và tính lại kết quả",
              type: "normal",
              onClick: (e) => {
                this.saveExamPaper(true, true);
              }
            },
              {
                text: "Chỉ lưu & không tính toán",
                type: "default",
                onClick: (e) => {
                  this.saveExamPaper(true);
                }
              }
              ,
              {
                text: "Bỏ qua",
                type: "default",
                stylingMode: "outlined",
                onClick: (e) => {
                  return {buttonText: "Bỏ qua"};
                }
              }
            ]
          });
          myDialog.show().then((dialogResult) => {
          });
        } else {
          this.saveExamPaper(true);
        }
      } else {
        this.saveExamPaper(false);
      }
    } else {
      this.notificationService.showNotification(Constant.WARNING, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  saveExamPaper(isEdit, reCalculate = false) {
    this.docLoading = false;
    if (!isEdit) {
      delete this.dataItem.id;
      this.dataItem.reCalculate = false;
    } else {
      this.dataItem.reCalculate = reCalculate;
    }
    this.dataItem.images = this.dataItem.files.map(en => en.source);
    if (this.dataItem.images.length === 0) {
      this.notificationService.showNotification(Constant.ERROR, 'Đề thi không được để trống!');
      return;
    }
    this.generalService.saveExamPaper(this.dataItem).subscribe(res => {
      this.isShowEdit = false;
      this.notificationService.showNotification(Constant.SUCCESS, isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công');
      this.loadGrid();
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
    });
  }

  closePopupEdit() {
    this.isShowEdit = false;
    this.docLoading = false;
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

      setTimeout(() => {

        this.tabSource = this.dataItem.files.map(en => {
          return {
            icon: this.service.getFileExt(en.source) + 'file',
            ext: this.service.getFileExt(en.source),
            title: this.service.getFileName(en.source),
            source: en.source,
          };
          if (!this.isImage(obj.source)) {
            setTimeout(() => this.docLoading = true, 500);
            this.selectedTabIndex = 1;
          }
        });
      }, 100);

      console.log(this.tabSource);
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
    const result = confirm(`Bạn có chắc chắn muốn xóa bài tập: <strong>${data.name}</strong> này?`, 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.deleteExamPaper(data.id).subscribe(en => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Xóa dữ liệu thành công');
          this.loadGrid();
        }, error => {

        });
      }
    });
  };

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

    setTimeout(() => {
      this.tabSource = this.dataItem.files.map(en => {
        return {
          icon: this.service.getFileExt(en.source) + 'file',
          ext: this.service.getFileExt(en.source),
          title: this.service.getFileName(en.source),
          source: en.source,
        };
      });
    }, 100);
  }

  doFilterClass($event) {
    console.log($event);
    this.loadGrid();
  }

  generateQuesion() {
    this.dataItem.questions = [];
    for (let i = 0; i < this.dataItem.numberQuestion; i++) {
      let q = {
        index: i + 1,
        numberOfAnswer: this.dataItem.numberOfAnswer,
        rightAnswers: [],
        answerType: 1,
        mark: parseFloat((10 / this.dataItem.numberQuestion).toFixed(2)),
      };
      this.dataItem.questions.push(q);
    }
    this.syncQuestion();
  }

  changeRowQuestion() {
    this.syncQuestion();
  }

  changeRowMark() {
    this.syncSumMark();
  }

  changeAswer(item) {
    setTimeout(() => {
      item.rightAnswers = [];
      let i = 1;
      item.answers.forEach(en => {
        if (en.checked) {
          item.rightAnswers.push(i);
        }
        i++;
      });
      console.log(item.rightAnswers);
    }, 0);
  }

  showResult(data: any) {
    console.log(data, this.tabClassSource);
    console.log(data, this.classSource);
    this.dataItem = Object.assign({}, data);
    this.tabClassSource = this.allClasses.filter(en => data.classIds.includes(en.id));
    this.tabClassSource.forEach(en => {
      en.text = en.name;
    });
    setTimeout(() => {
      this.classTabIndex = 0;
    }, 0);
    this.filterClassName = this.tabClassSource[0]?.text;

    this.popupResultTitle = `Kết quả thi đề: ${data.name}`;
    let payload = {
      id: data.id,
      schoolId: data.schoolId
    };
    this.generalService.getExamPaperResult(payload).subscribe(res => {
      this.studentResult = res.items;
      this.resultInfo = res;
      this.studentResult.forEach(en => {
        en.avgMark = en.avgMark ? parseFloat(en.avgMark).toFixed(2) : '';
        en.isCheatingText = en.isCheating ? '✔' : '';
      });

      this.studentClassResult = this.studentResult.filter(en => en.class === this.filterClassName);
      this.isShowPopupResult = true;
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
    });
  }

  onContentReady(e: DxDataGridTypes.ContentReadyEvent) {
    e.component.option('loadPanel.enabled', false);
  }

  viewDethi(item: any) {
    this.isShowPreview = true;
    this.tabSource = item.images.map(en => {
      return {
        icon: this.service.getFileExt(en) + 'file',
        ext: this.service.getFileExt(en),
        title: this.service.getFileName(en),
        source: en,
      };
    });
  }

  syncSumMark() {
    this.sumMark = 0;
    this.dataItem.questions.forEach(en => {
      this.sumMark += en.mark;
    });
  }

  isImage(path) {
    let ext = this.service.getFileExt(path);
    return ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp';
  }

  onDocumentLoaded() {
    setTimeout(() => this.docLoading = false, 100);
  }

  onViewResultClick = (data: any) => {
    this.isShowResult = true;
    this.examPaperData = Object.assign({}, this.dataItem);
    this.examPaperData.studentId = data.id
    this.popupResultStudentTitle = `${data.name}`;
  };

  onRedoClick(data) {
    let myDialog = custom({
      title: "Thông báo",
      messageHtml: `<div>Bạn có muốn hủy bỏ kết quả và cho học sinh <strong>${data.name}</strong> làm lại bài không?</div>`,
      buttons: [{
        text: "Đồng ý",
        type: "default",
        onClick: (e) => {
          let payload = {
            studentId: data.id,
            examPaperId: this.dataItem.id
          }
          this.generalService.removeStudentResults(payload).subscribe(res => {
            this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật thành công');
            this.showResult(this.dataItem);
          }, error => {
            this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
          });
          return {buttonText: e.component.option("text")}
        }
      },
        {
          text: "Bỏ qua",
          type: "default",
          stylingMode: "outlined",
          onClick: (e) => {
            return {buttonText: "Bỏ qua"};
          }
        }
      ]
    });
    myDialog.show().then((dialogResult) => {
    });
  }

  isSmallScreen(): boolean {
    return this.screenWidth < 430;
  }

  closePopupViewResult() {
    this.isShowResult = false;
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
        saveAs(new Blob([buffer], {type: 'application/octet-stream'}), `KETQUALAMBAI_${this.filterClassName}_${this.dataItem.name.toUpperCase()}.xlsx`);
      });
    });
    e.cancel = true;
  }

  classChange($event) {
    this.filterClassName = $event.itemData.text;
    this.studentClassResult = this.studentResult.filter(en => en.class === this.filterClassName);
  }
}
