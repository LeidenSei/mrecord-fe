import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {DxFileUploaderComponent, DxValidationGroupComponent} from "devextreme-angular";
import {Constant} from "../../../shared/constants/constant.class";
import {forkJoin} from 'rxjs';
import { Location } from '@angular/common';
import {DateToSystemTimezoneSetter} from "date-fns/parse/_lib/Setter";
import {DomSanitizer} from "@angular/platform-browser";
export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-lesson-player',
  templateUrl: './lesson-player.component.html',
  styleUrls: ['./lesson-player.component.scss']
})
export class LessonPlayerComponent implements OnInit, OnDestroy {
  isContentScrolled = false;
  getSizeQualifier = getSizeQualifier;
  iframeHeight = 1000;
  dataKhoaHoc: any;
  h5pFrame: any;
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  lmsUrl = this.configService.getConfig().api.curUrl;
  uploadHeaders: any;
  lessionTitle: any;
  courseId: any;
  dataItem: any;
  creator: any;
  ratingStar = 5;
  ratingComment = '';
  tabSource = [
    {
      icon: 'ordersbox',
      tab: 'lesson',
      title: 'Nội dung khóa học',
      tasks: [],
    },
    {
      icon: 'info',
      tab: 'info',
      title: 'Thông tin',
      tasks: [],
    },
    {
      icon: 'favorites',
      tab: 'comment',
      title: 'Đánh giá & nhận xét',
      tasks: [],
    },
    /*{
      icon: 'taskhelpneeded',
      tab: 'comment',
      title: 'Bình luận',
      tasks: [],
    }*/
  ];
  lessonSource = [];
  frameId = 'playerFrame';
  lessonId: any;
  lessonType: number;
  taiLieuUrl: any;
  user: any;
  private messageHandler: any;
  numbers: number[] = [5, 4, 3, 2, 1];
  isCreator = false;
  taiLieuSafeUrl: any;
  allowDownload = true;
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private sanitizer: DomSanitizer,
              private location: Location,
              private http: HttpClient,
              private ref: ChangeDetectorRef) {
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.frameId = 'playerFrame' + new Date().getMilliseconds();
  }

  ngAfterViewInit() {
    this.h5pFrame = document.getElementById(this.frameId);
    if (this.h5pFrame) {
      this.h5pFrame.setAttribute("src", this.getPlayerH5PUrl());
    }

  }
  getData(): void {
    const url = `${this.lmsUrl}/h5p/${this.dataItem.code}/play`;
    this.http.get(url).subscribe({
      next: (response) => {
        console.log('Dữ liệu:', response);  // Xử lý dữ liệu ở đây
      },
      error: (error) => {
        console.error('Lỗi:', error);
      }
    });
  }
  format(ratio) {
    return "";
  }

  removeMessageListener() {
    let i = window.removeEventListener('message', this.messageHandler, false);
  }

  getPlayerH5PUrl() {
    return this.h5pUrl + '/?v=' + new Date().getMilliseconds() + '&allowDownload=' + this.allowDownload;
  }

  async ngOnInit() {
    this.messageHandler = this.receiveMessage2.bind(this);
    window.addEventListener('message', this.messageHandler, false);

    this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.lessonId = this.route.snapshot.paramMap.get('lessonId');
    this.lessonType = +this.route.snapshot.paramMap.get('type');
    const fromSharedSource = this.route.snapshot.paramMap.get('from');
    if (fromSharedSource){
      this.allowDownload = false;
    }
    this.loadData();
  }

  receiveMessage2(event: any) {
    //console.log(event.data.type);
    if (!this.h5pFrame || !this.h5pFrame.contentWindow) {
      this.removeMessageListener();
      return;
    }
    if (event.origin !== this.h5pUrl) {
      return;
    }
    if (event.data.type === 'callParentFunction' && event.data.payload) {
      this.callParentFunction(event.data.payload);
    }
  }

  callParentFunction(payload) {
    //console.log('callParentFunction', payload);
    if (payload.loaded) {
      this.loginH5P();
    }
    if (payload.contentHeight) {
      this.iframeHeight = payload.contentHeight + 150;
    }
    if (payload.key === 'csrfTokenPlayer') {
      let lessonId = this.route.snapshot.paramMap.get('lessonId');
      if (lessonId) {
        this.loadLesson(lessonId, this.lessonType);
      }
    }
  }

  async loadData() {
    this.user = await this.authService.getUser();
    forkJoin([
      this.generalService.getKhoaHoc(this.courseId),
      this.generalService.getLessonByCourse(this.courseId)
    ]).subscribe(async ([khoahoc, lessonSource]) => {
      this.dataKhoaHoc = khoahoc;
      this.isCreator = this.user.data.id === khoahoc.accountId;
      this.lessonSource = lessonSource;
      let index = 1;
      this.lessonSource.forEach(en => {
        en.stt = index;
        index++;
      });
      this.creator = await this.generalService.getStaffById(this.dataKhoaHoc.accountId).toPromise();
      console.log(this.creator);
      if (this.lessonType === 1){
        this.loadLesson(this.lessonId, 1);
      }
    });
  }

  loadLesson(lessonId, type) {
    this.lessonType = type;
    if (type === 2) {
      this.generalService.getBaiGiang(lessonId).subscribe(res => {
        if (res) {
          this.dataItem = res;
          this.lessionTitle = res.name;
          this.lessonId = lessonId;
          this.generalService.xemBaiGiang(lessonId, this.user.data.id).toPromise();
          setTimeout(() => {
            this.playContent(this.dataItem.code);
            this.getData();
          }, 0);
          //Danh gia
          this.loadDanhGiaBinhLuan();
        } else {
          this.lessonType = 1;
        }
      }, error => {
      });
    } else {
      this.generalService.getTaiLieu(lessonId).subscribe(res => {
        this.dataItem = res;
        this.lessionTitle = res.name;
        this.lessonId = lessonId;
        this.taiLieuUrl = res.url;
        this.taiLieuSafeUrl = this.toSafeUrl();
        console.log('taiLieu', this.dataItem);
      }, error => {
      });
    }
  }

  playContent(contentId) {
    console.log('playerContent');
    if (this.h5pFrame && this.h5pFrame.contentWindow) {
      this.h5pFrame.contentWindow.postMessage({
        type: 'playContentId', contentId,
      }, '*');
    }
  }

  async loginH5P() {
    const user = await this.authService.getUser();
    setTimeout(() => {
      if (this.h5pFrame && this.h5pFrame.contentWindow) {
        this.h5pFrame.contentWindow.postMessage({
          type: 'doLoginPlayer', userId: new Date().getMilliseconds() + user.data.id, role: user.data.role
        }, '*');
      } else {
      }
    }, 0);
  }

  backToList() {
    this.location.back();
    //this.router.navigate(['/teacher/teacher-course', this.courseId, this.dataKhoaHoc ? this.dataKhoaHoc.name : '-']);
  }

  ngOnDestroy() {
    let i = this.removeMessageListener();
  }

  downloadFile() {

  }
  isImage(path){
    let ext = this.service.getFileExt(path);
    return ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp';
  }
  getFullName(item): string {
    // Lọc bỏ các trường rỗng và kết hợp các trường hợp còn lại thành fullName
    const fullName = [item.firstName, item.middleName, item.lastName]
      .filter(name => name && name.trim().length > 0)
      .join(' ');

    return fullName;
  }
  typeOfMedia(path) {
    return this.service.typeOfMedia(path);
  }
  toRating(item, star) {
    if (item.total === 0) return 0;
    let rate = 0;
    switch (star) {
      case 5:
        rate = item.fiveStar / item.total * 100;
        break;
      case 4:
        rate = item.fourStar / item.total * 100;
        break;
      case 3:
        rate = item.threeStar / item.total * 100;
        break;
      case 2:
        rate = item.twoStar / item.total * 100;
        break;
      case 1:
        rate = item.oneStar / item.total * 100;
        break;
    }
    return parseFloat(rate.toFixed(1));
  }

  toTotalRating(item) {
    if (item.total === 0) return '0';
    const temp = (item.fiveStar * 5 + item.fourStar * 4 + item.threeStar * 3 + item.twoStar * 2 + item.oneStar) / item.total
    const rate = parseFloat(temp.toFixed(2));
    return '' + rate;
  }

  submitRating() {
    if (!this.ratingComment){
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập nội dung đánh giá');
      return;
    }
    let payload = {
      baiGiangId: this.lessonId,
      content: this.ratingComment,
      rate: this.ratingStar
    }
    this.generalService.addBinhLuan(payload).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật thành công');
      this.loadDanhGiaBinhLuan();
      this.ratingComment = '';
      this.ratingStar = 5;
    }, error => {

    });
  }
  loadDanhGiaBinhLuan(){
    this.generalService.getDanhGiaBaiGiang(this.lessonId).subscribe(rateItem => {
      console.log(rateItem);
      this.dataItem.rateItem = rateItem;
    });
  }

  toEditLesson(dataItem: any) {
    this.router.navigate(['/teacher/lesson-editor', this.courseId, dataItem.id]);
  }
  toUnCachedUrl(url){
    return url + '?v=' + new Date().getHours();
  }
  toSafeUrl(){
    console.log(this.taiLieuUrl);
    let url = `https://view.officeapps.live.com/op/embed.aspx?src=${this.taiLieuUrl}`
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  toShareLesson(dataItem: any) {
    console.log(dataItem, this.dataKhoaHoc);
    let newItem = {
      code: dataItem.code,
      name: dataItem.name,
      dateCreated: dataItem.dateCreated,
      courseName: this.dataKhoaHoc.name,
      creatorName: this.user.data.fullname,
      schoolName: this.user.data.schoolName,
    };
    //console.log(newItem);
    let encode = this.service.encodeAndCompress(JSON.stringify(newItem));
    let copiedUrl = this.lmsUrl + '/public-lesson?code=' + encode;
    //console.log(copiedUrl);
    navigator.clipboard.writeText(copiedUrl).then(() => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Đã sao chép link bài giảng cần chia sẻ');
      console.log('Đã sao chép vào clipboard');
    }).catch(err => {
      console.error('Lỗi khi sao chép vào clipboard:', err);
    });
  }

  toShareScorm(dataItem: any) {
    let copiedUrl = this.taiLieuUrl;
    //console.log(copiedUrl);
    navigator.clipboard.writeText(copiedUrl).then(() => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Đã sao chép link bài giảng scorm cần chia sẻ');
      console.log('Đã sao chép vào clipboard');
    }).catch(err => {
      console.error('Lỗi khi sao chép vào clipboard:', err);
    });
  }
}
