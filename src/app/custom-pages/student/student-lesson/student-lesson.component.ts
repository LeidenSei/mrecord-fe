import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";
import {forkJoin} from 'rxjs';
import {custom} from 'devextreme/ui/dialog';
import {ScreenSizeService} from "../../../services/screen-service.service";
import {DomSanitizer} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";

export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

@Component({
  selector: 'app-student-lesson',
  templateUrl: './student-lesson.component.html',
  styleUrls: ['./student-lesson.component.scss']
})
export class StudentLessonComponent implements OnInit, OnDestroy {
  isContentScrolled = false;
  getSizeQualifier = getSizeQualifier;
  iframeHeight:any;
  tabHeight: any;
  dataKhoaHoc: any;
  h5pFrame: any;
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  lmsUrl = this.configService.getConfig().api.curUrl;
  uploadHeaders: any;
  lessonTitle: any;
  courseId: any;
  dataItem: any;
  creator: any;
  ratingStar = 5;
  ratingComment = '';
  isMobileScreen: boolean;
  allowDownload = true;
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
  hoanThanhSource = [];
  chuaHoanThanhSource = [];
  frameId = 'playerFrame';
  lessonId: any;
  lessonType: number;
  taiLieuUrl: any;
  taiLieuSafeUrl: any;
  private messageHandler: any;
  numbers: number[] = [5, 4, 3, 2, 1];
  user: any;
  riengTu = false;

  h5pObject: any;
  constructor(private service: DataService,
              private screenSizeService: ScreenSizeService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private sanitizer: DomSanitizer,
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

  format(ratio) {
    return "";
  }

  removeMessageListener() {
    let i = window.removeEventListener('message', this.messageHandler, false);
  }

  getPlayerH5PUrl() {
    return this.h5pUrl;
  }
  typeOfMedia(path) {
    return this.service.typeOfMedia(path);
  }
  async ngOnInit() {
    this.screenSizeService.isMobileScreen$.subscribe(isMobile => {
      this.isMobileScreen = isMobile;
    });
    this.iframeHeight = this.isMobileScreen ? 'auto' : '1000';
    this.tabHeight = this.isMobileScreen ? 'auto' : 'auto';
    this.user = await this.authService.getUser();
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.lessonId = this.route.snapshot.paramMap.get('lessonId');
    this.lessonType = +this.route.snapshot.paramMap.get('type');
    this.messageHandler = this.receiveMessage2.bind(this);
    window.addEventListener('message', this.messageHandler, false);
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
      let lessonId = this.lessonId;
      if (lessonId) {
        this.loadLesson(lessonId, this.lessonType);
      }
    }
    if (payload.key === 'lesson-data'){
        console.log('lesson-data', payload.value.integration.contents['cid-' + this.dataItem.code]);
        let h5pObj = payload.value.integration.contents['cid-' + this.dataItem.code];
        let h5pJsonContent = JSON.parse(h5pObj.jsonContent);
        if (h5pObj.library.includes('IFrameEmbed')){
          console.log(h5pJsonContent);
          this.h5pObject = h5pJsonContent;
        }
    }
    if (payload.key === 'xAPI') {
      const statement = payload.statement;
      //console.log('xAPI', payload, );
      let verb = this.service.getVerb(statement);
      console.log(statement.object.id, verb);
      if ((!statement.object.id.includes('subContent') && verb === 'completed') || (!statement.object.id.includes('subContent') && verb === 'answered')) {
        console.log('statement', statement.result);
        let result = {
          studentId: this.user.data.studentId ? this.user.data.studentId : '000000000000000000000000',
          classId: this.user.data.classId,
          schoolId: this.user.data.schoolId,
          khoaHocId: this.dataKhoaHoc.id,
          baiGiangId: this.lessonId,
          trangThaiHoc: 2,
          diem: statement.result.score.raw,
          tongDiem: 10,
          soCauHoi: +statement.result.score.max,
          soCauDung: +statement.result.score.raw,
          thoiGianLamBai: this.service.toDuration(statement.result?.duration),
          chiTiet: JSON.stringify(statement.object)
        };
        const diemMoiCau =  10 / result.soCauHoi; //parseFloat (10 / result.soCauHoi).toFixed(2);
        const diem =  parseFloat((diemMoiCau * result.soCauDung).toFixed(2));
        result.diem = diem;
        let myDialog = custom({
          title: "Hoàn thành",
          messageHtml: `<div style="text-align: center">
                            <div><strong style="font-size: 24px;color:#22a507;">Điểm ${diem}</strong></div>
                            <div style="font-size: 18px;">Chúc mừng bạn đã hoàn thành bài trắc nghiệm, bạn đúng <strong>${result.soCauDung}/${result.soCauHoi}</strong> câu</div>
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
        this.generalService.updateKetQuaBaiGiang(result).subscribe(res => {
          if (res.code !== 0) {
            this.notificationService.showNotification(Constant.ERROR, res.message);
          } else {

          }
        }, error => {
        });
        console.log('result', result);
      } else {

      }
    }
  }

  async loadData() {
    forkJoin([
      this.generalService.getKhoaHoc(this.courseId),
      this.generalService.getLessonWithResultByCourse(this.courseId, this.user.data.studentId ? this.user.data.studentId : '000000000000000000000000',)
    ]).subscribe(async ([khoahoc, lessonSource]) => {
      this.dataKhoaHoc = khoahoc;
      this.lessonSource = lessonSource;

      this.hoanThanhSource = lessonSource.filter(en => en.hoanThanh);
      let index = 1;
      this.hoanThanhSource.forEach(en => {
        en.stt = index;
        index++;
      });

      this.chuaHoanThanhSource = lessonSource.filter(en => !en.hoanThanh);
      index = 1;
      this.chuaHoanThanhSource.forEach(en => {
        en.stt = index;
        index++;
      });

      this.creator = await this.generalService.getStaffById(this.dataKhoaHoc.accountId).toPromise();
      if (this.lessonType === 1){
        this.loadLesson(this.lessonId, 1);
      }
    });
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
  goLessionLink(lessonId, type) {
    //console.log(this.dataKhoaHoc, lessonId, type);
    if (type === 2) //H5P
    {
      const h5pLink = `/student/lesson-view/${this.dataKhoaHoc.id}/${lessonId}/${type}`;
      location.href = h5pLink;
    } else {
      this.loadLesson(lessonId, type);
    }
  }

  loadLesson(lessonId, type) {
    this.lessonType = type;
    if (type === 2) {
      this.generalService.getBaiGiang(lessonId).subscribe(res => {
        if (res) {

          this.dataItem = res;
          this.lessonTitle = res.name;
          this.lessonId = lessonId;
          if (res.riengTu){
            this.riengTu = res.riengTu;
            //alert('Bài giảng đã được giáo viên chuyển sang chế độ riêng tư để chỉnh sửa. Vui lòng chọn bài giảng khác hoặc quay trở lại sau.');
            return;
          }
          this.generalService.xemBaiGiang(lessonId, this.user.data.studentId).toPromise();

          setTimeout(() => {
            this.playContent(this.dataItem.code);
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
        this.lessonTitle = res.name;
        this.lessonId = lessonId;
        this.taiLieuUrl = res.url;
        this.taiLieuSafeUrl = this.toSafeUrl();
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
        /*this.h5pFrame = document.getElementById(this.frameId);
        if (this.h5pFrame) {
          this.h5pFrame.setAttribute("src", this.getPlayerH5PUrl());
        }*/
      }
    }, 0);
  }

  backToList() {
    this.router.navigate(['/student/class-course']);
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
    if (!this.ratingComment) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng nhập nội dung đánh giá');
      return;
    }
    let payload = {
      baiGiangId: this.lessonId,
      content: this.ratingComment,
      rate: this.ratingStar,
      studentId: this.user.data.studentId
    }
    this.generalService.addBinhLuan(payload).subscribe(en => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật thành công');
      this.loadDanhGiaBinhLuan();
      this.ratingComment = '';
      this.ratingStar = 5;
    }, error => {

    });
  }

  loadDanhGiaBinhLuan() {
    this.generalService.getDanhGiaBaiGiang(this.lessonId).subscribe(rateItem => {
      console.log(rateItem);
      this.dataItem.rateItem = rateItem;
    });
  }
  toSafeUrl(){
    let url = `https://view.officeapps.live.com/op/embed.aspx?src=${this.taiLieuUrl}`
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  toUnCachedUrl(url){
    return url + '?v=' + new Date().getHours();
  }
}
