import {ChangeDetectorRef, Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {FullNamePipe} from "../../../pipes/full-name.pipe";
import {Constant} from "../../constants/constant.class";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-student-exampaper-result-detail',
  templateUrl: './student-exampaper-result-detail.component.html',
  styleUrls: ['./student-exampaper-result-detail.component.scss']
})
export class StudentExampaperResultDetailComponent implements OnInit{
  studentResults = [];
  isSubmitting = false;
  resultDetailTitle: any;
  isShowResultDetail = false;
  examPopupWidth = '80%';
  questionWithRightAnswers = [];
  letterArray = [];
  dateNow: any;
  currentResult: any;
  isShowResultAutoDetail = false;

  @Input() isMobile: any;
  @Input() examPaper: any;
  alphabetArray = [];
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private fullNamePipe: FullNamePipe,
              public sanitizer: DomSanitizer,
              private ref: ChangeDetectorRef) {
    this.letterArray = this.service.getAlphabetArray();
    this.currentResult = {};
  }
  async ngOnInit() {
    this.alphabetArray = this.service.getAlphabetArray();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['examPaper'] && !changes['examPaper'].isFirstChange()) {
      //this.refreshData(changes['baiGiang'].currentValue);
      this.loadGridResult();
    }
  }

  loadGridResult(){
    this.studentResults = [];
    let payload = {
      studentId: this.examPaper.studentId,
      examPaperId: this.examPaper.id
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
  }
  onContentReady(e: DxDataGridTypes.ContentReadyEvent) {
    e.component.option('loadPanel.enabled', false);
  }
  calculateMinutesRemaining(startTime: any, endTime: any): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const differenceInMilliseconds = end - start; // Tính khoảng cách thời gian
    const differenceInMinutes = Math.floor(differenceInMilliseconds / 1000 / 60); // Chuyển đổi từ mili giây sang phút

    return differenceInMinutes;
  }
  getMaxMarkResult() {
    if (this.studentResults.length) {
      const maxScore = this.studentResults.reduce((max, current) => {
        return current.totalMark > max.totalMark ? current : max;
      }, this.studentResults[0]);
      return maxScore.totalMark;
    } else return '';
  }

  showResultDetail(data: any) {
    this.currentResult = data;
    this.resultDetailTitle = `Đề thi: ${this.examPaper.name} - Lần thi: ${data.stt}`;
    /*console.log(data);
    console.log(this.dataItem);*/
    this.isShowResultDetail = true;
    this.questionWithRightAnswers = this.examPaper.questions;
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
    this.currentResult.rightCount = rightCount + '/' + this.examPaper.questions.length;
  }
  areArraysEqual(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }

    const sortedArr1 = arr1.slice().sort((a, b) => a - b);
    const sortedArr2 = arr2.slice().sort((a, b) => a - b);

    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }

  closePopupViewResultDetail() {
    this.isShowResultDetail = false;
  }

  showResultAutoDetail(data: any) {
    this.currentResult = data;
    this.resultDetailTitle = `Đề thi: ${this.examPaper.name} - Lần thi: ${data.stt}`;
    this.isShowResultAutoDetail = true;
    this.currentResult.studentAnswers2 = this.transformHtml(this.currentResult.studentAnswers2);
    let rightCount = 0;
    this.currentResult.studentAnswers2.forEach(en => {
      en.answers = this.transformHtml(en.answers);
      if (en.answers[en.choosenIndex] && en.answers[en.choosenIndex].isCorrect){
        rightCount++;
      }
    });
    this.currentResult.rightCount = `${rightCount}/${this.currentResult.studentAnswers2.length}`;
  }
  transformHtml(items: any[]): any {
    items.forEach(en => {
      en.htmlText = this.sanitizer.bypassSecurityTrustHtml(en.text);
    });
    return items;
  }

}
