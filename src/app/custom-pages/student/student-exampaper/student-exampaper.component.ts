import {AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {DxValidationGroupComponent} from "devextreme-angular";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import CustomStore from "devextreme/data/custom_store";
import {LoadOptions} from "devextreme/data";
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {confirm} from "devextreme/ui/dialog";
import {forkJoin, lastValueFrom} from 'rxjs';
import {custom} from 'devextreme/ui/dialog'
import {CountdownConfig} from "ngx-countdown";
import {DomSanitizer} from "@angular/platform-browser";
import {CarouselComponent} from "ngx-bootstrap/carousel";
import {MathjaxComponent} from "../../../components/utils/mathjax/mathjax.component";

// @ts-ignore

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

export function getPopupWidth(width: number) {
  if (width <= 420) return '100%';
  return '80%';
}

@Component({
  selector: 'app-student-exampaper',
  templateUrl: './student-exampaper.component.html',
  styleUrls: ['./student-exampaper.component.scss']
})
export class StudentExampaperComponent implements OnInit, AfterViewInit {
  isShowEdit = false;
  isShowResult = false;
  getSizeQualifier = getSizeQualifier;
  getPopupWidth = getPopupWidth;
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
    {text: 'Đã làm', id: 1},
  ];
  filterSubjectId: any;
  dataSource: any;
  readonly allowedPageSizes = this.service.getAllowPageSizes();
  tabSource = [];
  resultItem: any;
  resultImages = [];
  examTitle: any;
  isShowExamForm = false;
  isShowExamAutoForm = false;
  docLoading = false;
  resultQuestions = [];
  questionWithRightAnswers = [];
  letterArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  countdownConfig: any;
  currentResult: any;
  isSubmitting = false;

  studentResults = [];
  resultDetailTitle: any;
  isShowResultDetail = false;
  isShowResultAutoDetail = false;
  examPopupWidth = '80%';
  dateNow: any;
  public screenWidth: number;
  shuffleQuestions = [];
  userAnswers = [];
  currentSlide = 0;
  alphabetArray = [];
  swiperInstance: any;
  isExamDoing: boolean = false;
  countdown: number | null = null; // Biến đếm ngược
  countdownTimer: any; // Lưu bộ đếm thời gian
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;
  @ViewChild('carousel', {static: false}) carousel?: CarouselComponent;

  zoomLevel: number = 1;
  isAutoNextQuestion = false;

  private iframeFocused = false;
  isTabHidden: boolean = false;
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
    this.resultDetailTitle = '';
    this.currentResult = {};
    this.dateNow = new Date();
    this.alphabetArray = this.service.getAlphabetArray();
  };

  zoomIn() {
    this.zoomLevel += 0.1; // Tăng mức zoom lên 20%
  }

  zoomOut() {
    this.zoomLevel -= 0.1; // Giảm mức zoom đi 20%
  }

  ngAfterViewInit(): void {

  }

  @HostListener('window:focus', ['$event'])
  onFocus(event: any) {
    if (!this.isTabHidden) {
      // Xử lý khi học sinh quay lại tab
      console.log('Học sinh đã quay lại tab.');
      if (this.countdown !== null) {
        this.clearCountdown();
      }
    }
  }

  @HostListener('window:blur', ['$event'])
  onBlur(event: any) {
    this.handleTabHidden();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Cập nhật kích thước màn hình khi thay đổi kích thước cửa sổ
    this.screenWidth = window.innerWidth;
  }

  isSmallScreen(): boolean {
    return this.screenWidth < 430;
  }

  typeOfMedia(path) {
    return this.service.typeOfMedia(path);
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        if ((this.isShowExamAutoForm || this.isShowExamForm) && this.dataItem.isAntiCheating) {
          e.preventDefault();
          //alert('Chức năng này bị vô hiệu hóa khi làm bài thi.');
        }
      }
    });
  }

  setCountdownTime(seconds: number) {
    this.countdownConfig = {
      leftTime: seconds,
      format: 'HH:mm:ss',
      prettyText: (text) => {
        const parts = text.split(':');
        return `<span class="hours">${parts[0]}</span>:<span class="minutes">${parts[1]}</span>:<span class="seconds">${parts[2]}</span>`;
      }
    };
  }

  async loadGrid() {
    const authService = this.authService;
    const generalService = this.generalService;
    const filterSubjectId = this.filterSubjectId;
    const filterClassIds = this.filterClassIds;
    const filterStatus = this.filterStatus;
    const dateNow = this.dateNow;
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
            studentId: user.data.studentId,
            status: filterStatus
          };
          if (!filterSubjectId) {
            delete payload.subjectId;
          }

          let result = await lastValueFrom(generalService.getStudentExamPaper(payload));
          let index = 1;
          // @ts-ignore

          //let retResult = filterStatus >= 0 ? result.filter(en => en.resultType === filterStatus) : result;
          result.items.forEach(en => {
            en.stt = loadOptions.skip + index++;
            en.notStart = dateNow < new Date(en.fromDate);
          });
          return {
            // @ts-ignore
            data: result.items,
            // @ts-ignore
            totalCount: result.totalCount,
            /*summary: 10000,
            groupCount: 10,*/
          };
        } catch (err) {
          console.log(err);
        }
      }
    })
  }

  onEditClick = (data: any) => {
    console.log(data);
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
    } else {
      this.resultItem = {
        id: '',
        content: '',
        imageUrls: [],
        studentId: '',
        homeworkId: item.id,
        isSubmit: true,
        mark: '',
        reviewMark: ''
      };

    }
  };

  onViewResultClick = (data: any) => {
    this.studentResults = [];
    console.log(data);
    let item = data;
    this.dataItem = Object.assign({}, data);
    this.isShowResult = true;
    let payload = {
      studentId: this.user.data.studentId,
      examPaperId: this.dataItem.id
    };
    this.generalService.getStudentExamPaperResult(payload).subscribe(res => {
      this.studentResults = res;
      let stt = 0;
      this.studentResults.forEach(en => {
        stt++;
        en.stt = stt;
        en.actionMinutes = this.calculateMinutesRemaining(en.startTime, en.endTime) + ' phút'
      });
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Không lấy được danh sách kết quả thi');
    });
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

  viewDsBaiGiang(id: string, name: string) {
    //this.router.navigate(['/teacher/teacher-course', id, name]);
  }

  tabStatusChange($event) {
    this.filterStatus = $event.itemData.id;
    this.loadGrid();
  }

  subjectChange($event) {
    this.filterSubjectId = $event.itemData.id;
    this.loadGrid();
  }

  doExam(data: any) {
    this.examTitle = data.name;
    this.dataItem = Object.assign({}, data);
    this.resultQuestions = this.dataItem.questions;
    this.resultQuestions.forEach(en => {
      en.answers = [];
      for (let i = 0; i < en.numberOfAnswer; i++) {
        en.answers.push({name: this.letterArray[i], checked: false, value: i + 1});
      }
    });
    console.log(this.resultQuestions);
    let myDialog = custom({
      title: "Thông báo",
      messageHtml: "<div style='font-size: 25px'>Bạn có muốn làm bài kiểm tra ngay không?</div>",
      buttons: [{
        text: "Đồng ý",
        type: "default",
        onClick: (e) => {
          this.isShowExamForm = true;
          this.tabSource = [];
          data.images.forEach(en => {
            this.tabSource.push({
              icon: this.service.getFileExt(en) + 'file',
              ext: this.service.getFileExt(en),
              title: this.service.getFileName(en),
              source: en,
            });
          });
          if (this.tabSource.length) {
            let checkDocumentFile = this.service.typeOfMedia(this.tabSource[0].source) === 'document';
            if (checkDocumentFile) {
              setTimeout(() => this.docLoading = true, 500);
            }
          }
          //call api start Exam here
          let payload = {
            schoolId: this.user.data.schoolId,
            examPaperId: data.id,
            studentId: this.user.data.studentId
          };
          this.generalService.startExam(payload).subscribe(res => {
            if (res && res.id) {
              this.currentResult = res;
              let seconds = this.calculateSecondsRemaining(res.currentTime, res.endTime);
              this.setCountdownTime(seconds);
              this.setIframeFunction();
            }
          }, error => {
          });

          this.loadGrid();
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
      console.log(dialogResult.buttonText);
    });
  }

  setIframeFunction() {

    const docViewer = document.getElementById('doc-viewer');
    if (docViewer) {
      this.iframeFocused = true;
      // Khi chuột di vào vùng doc-viewer
      docViewer.addEventListener('mouseenter', () => {
        this.iframeFocused = true;
        console.log('Mouse entered doc-viewer');
      });

      // Khi chuột rời khỏi vùng doc-viewer
      docViewer.addEventListener('mouseleave', () => {
        this.iframeFocused = false;
        console.log('Mouse left doc-viewer');
      });

      // Khi nhấp vào doc-viewer
      docViewer.addEventListener('click', () => {
        this.iframeFocused = true;
        console.log('Clicked on doc-viewer');
      });
    } else {
      console.error('Doc-viewer not found');
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Tab hidden - anti-cheating triggered');
        this.isTabHidden = true;
        this.handleTabHidden();
      } else {
        console.log('Tab visible again');
        this.isTabHidden = false;
        this.clearCountdown();
      }
    });

  }

  handleTabHidden() {
    console.log('------------onBlur');
    if (this.iframeFocused) {
      //this.iframeFocused = false;
      console.log('Blur ignored due to interaction with doc-viewer');
      return;
    }
    console.log('Window blurred - anti-cheating logic triggered');
    if (this.dataItem.isAntiCheating && (this.isShowExamAutoForm || this.isShowExamForm)) {
      this.startCountdown();
    }
  }


  doAutoExam(data: any) {
    this.examTitle = data.name;
    this.dataItem = Object.assign({}, data);
    this.shuffleQuestionsAndAnswers(this.dataItem.autoQuestions.slice());

    console.log(this.resultQuestions);
    let myDialog = custom({
      title: "Thông báo",
      messageHtml: "<div style='font-size: 25px'>Bạn có muốn làm bài kiểm tra ngay không?</div>",
      buttons: [{
        text: "Đồng ý",
        type: "default",
        onClick: (e) => {
          this.isShowExamAutoForm = true;
          //call api start Exam here
          let payload = {
            schoolId: this.user.data.schoolId,
            examPaperId: data.id,
            studentId: this.user.data.studentId
          };
          this.generalService.startExam(payload).subscribe(res => {
            if (res && res.id) {
              this.currentResult = res;
              let seconds = this.calculateSecondsRemaining(res.currentTime, res.endTime);
              this.setCountdownTime(seconds);
            }
          }, error => {
          });

          this.loadGrid();
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
      console.log(dialogResult.buttonText);
    });
  }

  calculateSecondsRemaining(curTime: any, endTime: any): number {

    const now = new Date(curTime).getTime(); // Lấy thời gian hiện tại
    const end = new Date(endTime).getTime(); // Chuyển đổi thời gian kết thúc bài thi sang mili giây

    const differenceInMilliseconds = end - now; // Tính khoảng cách thời gian
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000); // Chuyển đổi từ mili giây sang giây

    return differenceInSeconds;
  }

  calculateMinutesRemaining(startTime: any, endTime: any): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const differenceInMilliseconds = end - start; // Tính khoảng cách thời gian
    const differenceInMinutes = Math.floor(differenceInMilliseconds / 1000 / 60); // Chuyển đổi từ mili giây sang phút

    return differenceInMinutes;
  }

  closePopupDoExam() {
    this.isShowExamForm = false;
    this.docLoading = false;
  }

  onDocumentLoaded() {
    setTimeout(() => this.docLoading = false, 500);
  }

  changeAswer(item: any) {

  }

  parseRightAnswer() {
    let studentAnswers = [];
    console.log(this.resultQuestions);
    this.resultQuestions.forEach(en => {
      const rightNumbers = [];
      en.answers.forEach(an => {
        if (an.checked) rightNumbers.push(an.value);
      });
      studentAnswers.push(rightNumbers);
    });
    return studentAnswers;
  }

  doSaveResult() {
    this.isSubmitting = true;
    let myDialog = custom({
      title: "Thông báo",
      messageHtml: "<div style='font-size: 25px'>Bạn có muốn nộp bài khi thời gian chưa kết thúc không?</div>",
      buttons: [{
        text: "Đồng ý",
        type: "default",
        onClick: (e) => {
          let payload = {
            studentAnswers: this.parseRightAnswer(),
            id: this.currentResult.id
          };
          this.generalService.saveStudentExamResult(payload).subscribe(res => {
            this.isSubmitting = false;
            if (res) {
              this.notificationService.showNotification(Constant.SUCCESS, 'Nộp bài tập thành công');
              this.isShowExamForm = false;
              this.loadGrid();
            } else {
              this.notificationService.showNotification(Constant.ERROR, 'Nộp bài tập thất bại, vui lòng thử lại');
            }
            return {buttonText: e.component.option("text")}
          }, error => {
            this.isSubmitting = false;
            this.notificationService.showNotification(Constant.ERROR, 'Nộp bài tập thất bại, vui lòng thử lại');
          });
        }
      },
        {
          text: "Bỏ qua",
          type: "default",
          stylingMode: "outlined",
          onClick: (e) => {
            this.isSubmitting = false;
            return {buttonText: "Bỏ qua"};
          }
        }
      ]
    });
    myDialog.show().then((dialogResult) => {
      //console.log(dialogResult.buttonText);
    });
  }

  doSaveAutoResult() {
    let ktAnswer = 0;
    this.shuffleQuestions.forEach(en => {
      if (en.choosenIndex == undefined || en.choosenIndex == null) {
        //this.notificationService.showNotification(Constant.WARNING, 'Có câu trả lời chưa chọn đáp án. Bạn có chắc muốn nộp bài không');
        ktAnswer++;
      }
    });
    let confirmTitle = 'Bạn có chắc chắn muốn nộp bài không?';
    if (ktAnswer) {
      confirmTitle = `Có ${ktAnswer} câu trả lời chưa chọn đáp án. Bạn có chắc muốn nộp bài không`;
    }
    this.isSubmitting = true;
    let myDialog = custom({
      title: "Thông báo",
      messageHtml: `<div style='font-size: 25px'>${confirmTitle}</div>`,
      buttons: [{
        text: "Đồng ý",
        type: "default",
        onClick: (e) => {
          let payload = {
            studentAnswers2: this.shuffleQuestions,
            id: this.currentResult.id
          };
          this.generalService.saveStudentExamAutoResult(payload).subscribe(res => {
            this.isSubmitting = false;
            if (res) {
              this.notificationService.showNotification(Constant.SUCCESS, 'Nộp bài tập thành công');
              this.isShowExamAutoForm = false;
              this.loadGrid();
            } else {
              this.notificationService.showNotification(Constant.ERROR, 'Nộp bài tập thất bại, vui lòng thử lại');
            }
            return {buttonText: e.component.option("text")}
          }, error => {
            this.isSubmitting = false;
            this.notificationService.showNotification(Constant.ERROR, 'Nộp bài tập thất bại, vui lòng thử lại');
          });
        }
      },
        {
          text: "Bỏ qua",
          type: "default",
          stylingMode: "outlined",
          onClick: (e) => {
            this.isSubmitting = false;
            return {buttonText: "Bỏ qua"};
          }
        }
      ]
    });
    myDialog.show().then((dialogResult) => {
      //console.log(dialogResult.buttonText);
    });
  }

  handleEvent($event) {
    if ($event.action === 'done') {

      //api save here
    }
  }

  closePopupViewResult() {
    this.isShowResult = false;
  }

  onContentReady(e: DxDataGridTypes.ContentReadyEvent) {
    e.component.option('loadPanel.enabled', false);
  }

  getMaxMarkResult() {
    if (this.studentResults.length) {
      const maxScore = this.studentResults.reduce((max, current) => {
        return current.totalMark > max.totalMark ? current : max;
      }, this.studentResults[0]);
      return maxScore.totalMark;
    } else return '';
  }

  closePopupViewResultDetail() {
    this.isShowResultDetail = false;
  }

  showResultDetail(data: any) {
    if (this.dataItem.isRunning) {
      this.notificationService.showNotification(Constant.WARNING, 'Không thể xem kết quả chi tiết khi chưa đến thời hạn');
      return;
    }

    this.currentResult = data;
    this.resultDetailTitle = `Đề thi: ${this.dataItem.name} - Lần thi: ${data.stt}`;
    this.isShowResultDetail = true;
    this.questionWithRightAnswers = this.dataItem.questions;
    let index = 0;
    let rightCount = 0;
    this.questionWithRightAnswers.forEach(en => {
      en.answers = [];
      for (let i = 0; i < en.numberOfAnswer; i++) {
        en.answers.push(
          {
            name: this.letterArray[i],
            checked: en.rightAnswers.includes(i + 1),
            value: i + 1,
          });
      }
      let myMind = this.currentResult.studentAnswers[index];

      en.myAnswer = myMind.length ? myMind.map(en => {
        return this.letterArray[en - 1]
      }) : '';
      en.isCorrect = this.areArraysEqual(en.rightAnswers, myMind);
      if (en.isCorrect) {
        rightCount++;
      }
      index++;
    });
    this.currentResult.rightCount = rightCount + '/' + this.dataItem.questions.length;
  }

  showResultAutoDetail(data: any) {
    if (this.dataItem.isRunning) {
      this.notificationService.showNotification(Constant.WARNING, 'Không thể xem kết quả chi tiết khi chưa đến thời hạn');
      return;
    }
    this.currentResult = data;
    this.resultDetailTitle = `Đề thi: ${this.dataItem.name} - Lần thi: ${data.stt}`;
    this.isShowResultAutoDetail = true;
    this.currentResult.studentAnswers2 = this.transformHtml(this.currentResult.studentAnswers2);
    let rightCount = 0;
    this.currentResult.studentAnswers2.forEach(en => {
      en.answers = this.transformHtml(en.answers);
      if (en.answers[en.choosenIndex] && en.answers[en.choosenIndex].isCorrect) {
        rightCount++;
      }
    });
    this.currentResult.rightCount = `${rightCount}/${this.currentResult.studentAnswers2.length}`;
  }

  areArraysEqual(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }

    const sortedArr1 = arr1.slice().sort((a, b) => a - b);
    const sortedArr2 = arr2.slice().sort((a, b) => a - b);

    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }

  transformHtml(items: any[]): any {
    items.forEach(en => {
      en.htmlText = this.sanitizer.bypassSecurityTrustHtml(en.text);
    });
    return items;
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

  onSwiper(swiper: any) {
    this.swiperInstance = swiper;
  }

  // Chọn câu trả lời
  selectAnswer(question: any, questionIndex: number, answerIndex: number): void {
    question.choosenIndex = answerIndex;
    this.userAnswers[questionIndex] = answerIndex;

    if (this.isAutoNextQuestion) {
      if (this.isLastSlide()) {
        this.currentSlide = 0;
      } else {
        this.currentSlide++;
      }
      this.goToSlide(this.currentSlide);
    }
  }

  // Chuyển đến slide cụ thể khi bấm vào câu hỏi trong danh sách
  goToSlide(index: number): void {
    this.currentSlide = index;
    this.carousel?.selectSlide(index);
    console.log(this.currentSlide);
  }

  isLastSlide(): boolean {
    return this.currentSlide === this.shuffleQuestions.length - 1;
  }

  // Bắt sự kiện khi slide thay đổi, cập nhật chỉ số của slide hiện tại
  onSlideChange($event): void {
    this.currentSlide = $event;
  }

  startCountdown() {
    this.countdown = 10;
    this.countdownTimer = setInterval(() => {
      if (this.countdown == null){
        this.clearCountdown();
        return;
      }
      if (this.countdown !== null && this.countdown > 0) {
        this.countdown--;
      } else {
        if (this.isShowExamAutoForm) {
          this.fnSaveAutoResult(true);
        } else if (this.isShowExamForm) {
          this.fnSaveResult(true);
        }
      }
    }, 1000); // Mỗi giây trừ 1
  }

  // Dừng đếm ngược khi người dùng quay lại tab
  clearCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdown = null;
      console.log('Đếm ngược bị hủy vì học sinh đã quay lại tab.');
    }
  }

  fnSaveResult(cheating = false) {
    let payload = {
      studentAnswers: this.parseRightAnswer(),
      id: this.currentResult.id,
      isCheating: cheating,
    };
    this.generalService.saveStudentExamResult(payload).subscribe(res => {
      this.isSubmitting = false;
      if (res) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Nộp bài tập thành công');
        this.isShowExamForm = false;
        this.loadGrid();
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Nộp bài tập thất bại, vui lòng thử lại');
      }
    }, error => {
      this.isSubmitting = false;
      this.notificationService.showNotification(Constant.ERROR, 'Nộp bài tập thất bại, vui lòng thử lại');
    });
  }

  fnSaveAutoResult(cheating = false) {
    let payload = {
      studentAnswers2: this.shuffleQuestions,
      isCheating: cheating,
      id: this.currentResult.id
    };
    this.generalService.saveStudentExamAutoResult(payload).subscribe(res => {
      this.isSubmitting = false;
      if (res) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Nộp bài tập tự động nộp thành công');
        this.isShowExamAutoForm = false;
        this.loadGrid();
      } else {
        this.notificationService.showNotification(Constant.ERROR, 'Nộp bài tập thất bại, vui lòng thử lại');
      }
    }, error => {
      this.isSubmitting = false;
      this.notificationService.showNotification(Constant.ERROR, 'Nộp bài tập thất bại, vui lòng thử lại');
    });
  }
}
