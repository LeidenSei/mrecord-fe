import {ChangeDetectorRef, Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../services";
import {GeneralService} from "../../services/general.service";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {NotificationService} from "../../services/notification.service";
import {AppConfigService} from "../../app-config.service";
import notify from "devextreme/ui/notify";
import {Constant} from "../../shared/constants/constant.class";
import * as pako from 'pako';
import {CommonModule} from "@angular/common";
import {QRCodeModule} from "angularx-qrcode";
@Component({
  selector: 'app-public-lesson',
  templateUrl: './public-lesson.component.html',
  styleUrls: ['./public-lesson.component.scss']
})
export class PublicLessonComponent implements OnInit, OnDestroy {
  errorMessage: any;
  taiLieuUrl: any;
  iframeHeight = 1000;
  lessonType: number;
  frameId = 'playerFrame';
  taiLieuSafeUrl: any;
  h5pFrame: any;
  private messageHandler: any;
  dataItem: any;
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  url: any;
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.url = location.href;
    const urlParams = new URLSearchParams(this.url.split('?')[1]);
    const code = urlParams.get('code');
    let decodeParam = this.service.decodeAndDecompress(code);
    this.dataItem = JSON.parse(decodeParam);
    console.log(this.dataItem);
  }
  ngAfterViewInit() {
    this.h5pFrame = document.getElementById(this.frameId);
    if (this.h5pFrame) {
      this.h5pFrame.setAttribute("src", this.getPlayerH5PUrl());
    }
  }
  getPlayerH5PUrl() {
    return this.h5pUrl + '/?v=' + new Date().getMilliseconds() + '&allowDownload=false';
  }
  typeOfMedia(path) {
    return this.service.typeOfMedia(path);
  }
  async loginH5P() {
    setTimeout(() => {
      if (this.h5pFrame && this.h5pFrame.contentWindow) {
        this.h5pFrame.contentWindow.postMessage({
          type: 'doLoginPlayer', userId: new Date().getMilliseconds() + this.randomChar(), role: 3
        }, '*');
      } else {
      }
    }, 0);
  }
  removeMessageListener() {
    let i = window.removeEventListener('message', this.messageHandler, false);
  }
  async ngOnInit() {
    this.messageHandler = this.receiveMessage2.bind(this);
    window.addEventListener('message', this.messageHandler, false);

    /*this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.lessonId = this.route.snapshot.paramMap.get('lessonId');
    this.lessonType = +this.route.snapshot.paramMap.get('type');
    const fromSharedSource = this.route.snapshot.paramMap.get('from');
    if (fromSharedSource){
      this.allowDownload = false;
    }*/
    this.loadLesson();
  }
  loadLesson(){
    this.playContent(this.dataItem.code);
  }
  playContent(contentId) {
    if (this.h5pFrame && this.h5pFrame.contentWindow) {
      this.h5pFrame.contentWindow.postMessage({
        type: 'playContentId', contentId,
      }, '*');
    }
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
  ngOnDestroy() {
    let i = this.removeMessageListener();
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
      this.loadLesson();
    }
  }
  randomChar(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
}
@NgModule({
  declarations: [
    PublicLessonComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    QRCodeModule
  ],
  providers: [
    // Các dịch vụ cần thiết như AuthService, DataService, GeneralService, ...
  ],
  exports: [
    PublicLessonComponent
  ]
})
export class PublicLessonModule {}
