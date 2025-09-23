import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
import {MathjaxComponent} from "../../../components/utils/mathjax/mathjax.component";
import forEach = CKEDITOR.tools.array.forEach;
import {ExportingEvent} from "devextreme/ui/data_grid";
import {Workbook} from "exceljs";
import {exportDataGrid as exportDataGridToXLSX} from "devextreme/excel_exporter";
import {saveAs} from 'file-saver-es';

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

@Component({
  selector: 'app-teacher-exam-paper-auto',
  templateUrl: './teacher-exam-paper-auto.component.html',
  styleUrls: ['./teacher-exam-paper-auto.component.scss']
})
export class TeacherExamPaperAutoComponent implements OnInit {
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
  uploadUrl = this.configService.getConfig().api.baseUrl + '/api/ExamPaper/ReadExamPaper';
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

  uploadQuestions = [];
  questions = [];
  shuffleQuestions = [];
  isShowPopupDownload = false;
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel', // Xuất tất cả dữ liệu
    exportSelectedRows: 'Export selected rows to Excel', // Xuất các dòng đã chọn
    exportTo: 'Export data', // Tiêu đề tổng
  };
  @ViewChild(MathjaxComponent) childView: MathjaxComponent;
  alphabetArray = [];

  //User
  currentIndex = 0;
  userAnswers: number[] = [];
  isCompleted = false;
  score = 0;
  examTitle: any;
  isShowResult = false;

  examPaperData: any;
  popupResultStudentTitle: any;
  public screenWidth: number;

  classTabIndex = 0;
  tabClassSource: any[] = [];
  filterClassName = '';
  studentResult: any[] = [];
  studentClassResult: any[] = [];

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
      questions: []
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
    this.alphabetArray = this.service.getAlphabetArray();
  };

  ngAfterViewInit() {
    //alert(this.h5pUrl);
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
      'pageSize': 200,
      isAuto: 1
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
        en.numberQuestion = en.autoQuestions.length;
        if (en.autoQuestions[0]) {
          en.numberOfAnswer = en.autoQuestions[0].answers.length;
        }
      });
    }, error => {
    });
  }

  addItemClick() {
    this.docLoading = false;
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

    this.questions = [];
    this.uploadQuestions = [];

    /* let temp = localStorage.getItem('exam-paper-temp');
     if (temp) {
       this.uploadQuestions = JSON.parse(temp).list;
       this.parseQuestion();
     }*/
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
    //this.syncQuestion();
    this.isShowEdit = true;
    this.uploadQuestions = this.dataItem.autoQuestions;
    this.parseQuestionEdit();

    let payload = {
      id: this.dataItem.id,
      schoolId: this.dataItem.schoolId
    }
    this.generalService.getExamPaperResult(payload).subscribe(res => {
      this.dataItem.hasResult = res.studentCount > 0;
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ' + error);
    });
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
          /*let myDialog = custom({
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
          });*/
        }
        this.saveExamPaper(true);
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
    if (!isEdit) {
      delete this.dataItem.id;
      this.dataItem.reCalculate = false;
    } else{
      this.dataItem.reCalculate = reCalculate;
    }
    this.dataItem.images = this.dataItem.files.map(en => en.source);
    this.dataItem.autoQuestions = this.questions;
    if (this.dataItem.autoQuestions.length === 0) {
      this.notificationService.showNotification(Constant.ERROR, 'Đề thi phải có ít nhất 1 câu hỏi!');
      return;
    }
    this.generalService.saveExamPaperAuto(this.dataItem).subscribe(res => {
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
    setTimeout(() => this.docLoading = true, 100);
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
      this.uploadQuestions = res.list;
      this.parseQuestion();
    }
    this.docLoading = false;
  }

  parseQuestionEdit() {
    this.questions = [];
    let i = 1;
    this.uploadQuestions.forEach(en => {
      const item = {
        stt: i,
        htmlText: this.sanitizer.bypassSecurityTrustHtml(en.text),
        text: en.text,
        answers: this.toAnswer(en.answers),
        mark: en.mark,
        correctAnswerId: en.correctAnswerId
      };
      this.questions.push(item);
      i++;
    });

    setTimeout(() => {
      this.childView ? this.childView.renderMath() : void (0);
    }, 0);
    console.log(this.questions);
  }

  parseQuestion() {
    this.questions = [];
    let i = 1;
    this.dataItem.numberQuestion = this.uploadQuestions.length;
    if (this.uploadQuestions.length) {
      this.dataItem.numberOfAnswer = this.uploadQuestions[0].answers?.length;
    }
    this.uploadQuestions.forEach(en => {
      const item = {
        stt: i,
        htmlText: this.sanitizer.bypassSecurityTrustHtml(en.text),
        text: en.text,
        answers: this.toAnswer(en.answers),
        mark: parseFloat((10 / this.dataItem.numberQuestion).toFixed(2)),
        correctAnswerId: ''
      };
      this.questions.push(item);
      i++;
    });

    setTimeout(() => {
      this.childView ? this.childView.renderMath() : void (0);
    }, 0);
    console.log(this.questions);
  }

  toAnswer(answers) {
    answers.forEach(en => {
      en.htmlText = this.sanitizer.bypassSecurityTrustHtml(en.text);
      en.text = en.text;
    });
    return answers;
  }

  onUploadError(e: any) {
    console.error('Upload error:', e);
    this.docLoading = false;
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
    //console.log(data);
    this.dataItem = Object.assign({}, data);
    this.tabClassSource = this.classSource.filter(en => data.classIds.includes(en.id));
    this.tabClassSource.forEach(en => {
      en.text = en.name;
    });
    setTimeout(() => {
      this.classTabIndex = 0;
    }, 1000);
    this.filterClassName = this.tabClassSource[0].text;
    this.popupResultTitle = `Kết quả thi đề: ${data.name}`;
    let payload = {
      id: data.id,
      schoolId: data.schoolId
    }
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

  onPreviewClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.viewDethi(e.row.data);
  }

  viewDethi(item: any) {
    this.currentIndex = 0;
    this.examTitle = item.name;
    this.isShowPreview = true;
    this.shuffleQuestions = [];

    setTimeout(() => {
      this.shuffleQuestionsAndAnswers(item.autoQuestions.slice());
      this.childView ? this.childView.renderMath() : void (0);
      this.currentIndex = 0;
    }, 0);
  }

  syncSumMark() {
    this.sumMark = 0;
    this.questions.forEach(en => {
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

  deleteAnswer(item: any, index: number) {
    const result = confirm('Bạn có chắc muốn xóa đáp án này không?', 'Xác nhận');
    result.then((dialogResult) => {
      if (dialogResult) {
        item.answers.splice(index, 1);
      }
    });
  }

  onAnswerCorrectChange(question: any, answer: any, $event) {
    setTimeout(() => {
      if ($event.value) {
        let q = question.answers.filter(en => en.text !== answer.text);
        q.forEach(en => {
          en.isCorrect = false;
        });
      }
    }, 0);

  }

  showPopupDownload() {
    this.isShowPopupDownload = true;
  }

  downloadSample() {
    const fileUrl = 'https://media.mschool.edu.vn/template/demau.zip';
    window.open(fileUrl, '_blank');
  }

  shuffle(items: any[]): any[] {
    let array = items;
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];

      array[currentIndex].htmlText = this.sanitizer.bypassSecurityTrustHtml(array[currentIndex].text);
    }
    //console.log(array);
    return array;
  }

  shuffleQuestionsAndAnswers(questions: any[]): void {
    //console.log(questions);
    // Shuffle the questions array
    this.shuffleQuestions = this.shuffle(questions);

    // Shuffle the answers for each question
    this.shuffleQuestions.forEach(question => {
      question.answers = this.shuffle(question.answers);
    });
    this.userAnswers = new Array(this.shuffleQuestions.length).fill(null);
    //console.log(this.userAnswers);
    console.log(this.shuffleQuestions);
  }

  selectAnswer(questionIndex: number, answerIndex: number): void {
    // Ghi nhận câu trả lời của người dùng
    this.userAnswers[questionIndex] = answerIndex;
    //this.next();
  }

  next(): void {
    // Chuyển tới câu hỏi tiếp theo
    console.log(this.currentIndex, this.shuffleQuestions.length - 1);
    if (this.currentIndex < this.shuffleQuestions.length - 1) {
      this.currentIndex++;
    } else {
      this.calculateScore();
    }
  }


  calculateScore(): void {
    // Tính điểm dựa trên câu trả lời đúng
    let soCauDung = 0;
    this.score = this.shuffleQuestions.reduce((score, question, index) => {
      const userAnswer = this.userAnswers[index];
      console.log(question, question.answers[userAnswer]);
      if (userAnswer !== null && question.answers[userAnswer].isCorrect) {
        soCauDung++;
        return score + question.mark;
      }
      return score;
    }, 0);

    let myDialog = custom({
      title: "Hoàn thành",
      messageHtml: `<div style="text-align: center">
                            <div><strong style="font-size: 24px;color:#22a507;">Điểm ${this.score}</strong></div>
                            <div style="font-size: 18px;">Chúc mừng bạn đã hoàn thành bài trắc nghiệm, bạn đúng <strong>${soCauDung}/${this.shuffleQuestions.length}</strong> câu</div>
                        </div>`,
      buttons: [
        {
          text: "Đóng",
          onClick: (e) => {
            return {buttonText: e.component.option("text")}
          }
        },
      ]
    });
    myDialog.show().then((dialogResult) => {
    });

    this.isCompleted = true;
  }

  onQuestionChange(event: any): void {
    console.log(event);
    this.currentIndex = this.shuffleQuestions.indexOf(event.addedItems[0]);

    console.log(this.currentIndex);
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

