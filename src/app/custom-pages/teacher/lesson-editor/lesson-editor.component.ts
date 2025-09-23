import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {DxFileUploaderComponent, DxValidationGroupComponent} from "devextreme-angular";
import {Constant} from "../../../shared/constants/constant.class";
import {custom} from 'devextreme/ui/dialog';
import { debounceTime } from 'rxjs/operators';
import {Subject} from "rxjs";
export function getSizeQualifier(width: number) {
  if (width <= 420) return 'xs';
  if (width <= 992) return 'sm';
  if (width < 1200) return 'md';
  return 'lg';
}

@Component({
  selector: 'app-lesson-editor',
  templateUrl: './lesson-editor.component.html',
  styleUrls: ['./lesson-editor.component.scss']
})

export class LessonEditorComponent implements OnInit, OnDestroy {
  @ViewChild('scrollDiv') scrollDiv: ElementRef;
  getSizeQualifier = getSizeQualifier;
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  datas = [];
  courseTitle = '';
  dataItem: any;
  isEdit = false;
  isContentScrolled = false;
  pageTitle = '';
  courseId: any;
  uploadHeaders: any;
  phanSource = [
    {id: 1, name: 'Phần 1: Tự nghiên cứu'},
    {id: 3, name: 'Phần 2: Hoạt động trên lớp'},
    {id: 2, name: 'Phần 3: Kiếm tra đánh giá'}
  ];
  iframeHeight = 1000;
  dataKhoaHoc: any;
  user: any;
  dataIsSaved = true;
  @ViewChild('baiGiangValidationGroup', {static: true}) baiGiangValidationGroup: DxValidationGroupComponent;
  @ViewChild("dropzone_external", {static: false}) dropZoneElement: ElementRef;
  @ViewChild("fileUploader", {static: false}) fileUploader: DxFileUploaderComponent;
  h5pFrame: any;
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  timer: any;
  private messageHandler: any;
  private saveSuccessResolve: (value: boolean) => void;
  private scrollSubject = new Subject<number>();
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
      riengTu: false,
      trangThai: 0,
      code: '',
      phan: 1,
      view: 0
    };
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.scrollSubject.pipe(
      debounceTime(500)  // 0.5 giây
    ).subscribe((scrollBottom: number) => {
      this.setCurrentScrollBottom(scrollBottom);
    });
  }
  canDeactivate(): Promise<boolean> | boolean {
    if (this.dataIsSaved) {
      return true; // Không có thay đổi, cho phép chuyển trang
    }
    return new Promise((resolve) => {
      const dialog = custom({
        title: 'Xác nhận',
        messageHtml: `
          <p style="font-size: 15px">Bạn có muốn lưu các thay đổi trước khi thoát trang không?</p>
        `,
        buttons: [
          { text: 'Lưu', onClick: () => 'save' },
          { text: 'Không lưu', onClick: () => 'dontSave' },
          { text: 'Hủy', onClick: () => 'cancel' },
        ],
      });

      dialog.show().then((result) => {
        if (result === 'save') {
          if (this.h5pFrame) {
            const contentId = 'new';
            this.h5pFrame.contentWindow.postMessage({type: 'triggerSave', contentId}, '*');
            this.saveSuccessResolve = resolve;
          }
          //resolve(false); // Cho phép chuyển trang
        } else if (result === 'dontSave') {
          resolve(true); // Cho phép chuyển trang
        } else if (result === 'cancel') {
          resolve(false); // Ở lại trang hiện tại
        }
      });
    });
  }
  showCustomDialog() {
    const dialog = custom({
      title: "Thông báo",
      messageHtml: `
        <p>Bạn có muốn lưu thay đổi cho bài giảng này không?</p>
        <small>Nếu bạn chọn "Không lưu", dữ liệu tạm thời của bài giảng này sẽ bị mất</small>
      `,
      buttons: [
        { stylingMode: "contained", type: 'success', text: "Lưu lại", onClick: () => "save" },
        { stylingMode: "contained", text: "Không lưu", onClick: () => "dontSave" },
        { stylingMode: "contained", text: "Bỏ qua", onClick: () => "cancel" }
      ]
    });

    dialog.show().then((result) => {
      if (result === "save") {
        console.log("Lưu lại");
        // Xử lý logic Lưu
      } else if (result === "dontSave") {
        console.log("Không lưu");
        // Xử lý logic Không Lưu
      } else if (result === "cancel") {
        console.log("Ở lại trang");
        // Xử lý logic Hủy
      }
    });
  }
  ngAfterViewInit() {
    //alert(this.h5pUrl);
    this.fileUploader.instance.option({
      dropZone: this.dropZoneElement.nativeElement,
      dialogTrigger: this.dropZoneElement.nativeElement
    });
    this.h5pFrame = document.getElementById('reactFrame1');
    this.h5pFrame.setAttribute("src", this.getEditorH5PUrl());
  }
  getEditorH5PUrl(){
    return this.h5pUrl + '/?v=' + new Date().getMilliseconds();
  }
  async ngOnInit() {
    this.messageHandler = this.receiveMessage.bind(this);
    window.addEventListener('message', this.messageHandler, false);

    this.user = await this.authService.getUser();
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.dataItem.khoaHocId = this.courseId;
    this.dataItem.schoolId = this.user.data.schoolId;
    this.dataItem.accountId = this.user.data.id;
    this.dataItem.accountType = this.user.data.role;
    this.dataItem.loaiBaiGiang = 2; //H5P
    let lessonId = this.route.snapshot.paramMap.get('lessonId');
    if (lessonId !== 'new') {
      this.isEdit = true;
      this.pageTitle = 'Sửa thông tin bài giảng';
    } else {
      this.isEdit = false;
      this.pageTitle = 'Tạo mới bài giảng';
    }
    this.loadCourse();
    //this.dataIsSaved = true;
    this.timer = setTimeout(() => {
      this.dataIsSaved = false; // Sau 10 giây, thay đổi giá trị
    }, 20000); // 10 giây (10000 milliseconds)
  }

  scroll({reachedTop = false}) {
    this.isContentScrolled = !reachedTop;
  }
  loadCourse(){
    this.generalService.getKhoaHoc(this.courseId).subscribe(res => {
      this.dataKhoaHoc = res;
      const isCreator = this.user.data.id === res.accountId;
      if (!isCreator){
        this.notificationService.showNotification(Constant.ERROR, 'Bạn không có quyền cập nhật bài giảng không phải do mình tạo!');
        this.router.navigate(['/teacher/teacher-course']);
      }
    }, error => {
    });
  }
  loadLesson(lessonId) {
    this.generalService.getBaiGiang(lessonId).subscribe(res => {
      this.dataItem = res;
      setTimeout(() => {
        this.setH5PContentId(this.dataItem.code);
      }, 300);
    }, error => {
    });
  }

  backToList() {
    this.router.navigate(['/teacher/teacher-course', this.courseId, this.dataKhoaHoc ? this.dataKhoaHoc.name : '-']);
  }

  onUploadStarted(e: any) {
    /*console.log('Upload started:', e);*/
  }

  onUploaded(e: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      console.log('Upload completed:', res);
      this.dataItem.anhDaiDien = res.url;
    }
  }

  onUploadError(e: any) {
    console.error('Upload error:', e);
  }

  receiveMessage(event: any) {
    if (event.origin !== this.h5pUrl) {
      return;
    }
    //console.log('Message from React:', event.data);
    if (event.data.type === 'callParentFunction' && event.data.payload) {
      this.callParentFunction(event.data.payload);
    }
  }
  callParentFunction(payload) {
    console.log('Parent function called from child', payload);
    if (payload.loaded){
      this.loginH5P();
      //console.log('1.loginH5P');
    }
    if (payload.contentHeight){
      this.iframeHeight = payload.contentHeight + 150;
    }
    if (payload.key === 'saveContentH5P'){
      //action save
      if (!payload.returnData){
        this.notificationService.showNotification(Constant.ERROR, 'Dữ liệu bài giảng không hợp lệ. Vui lòng kiểm tra các trường bắt buộc');
        this.saveSuccessResolve(false);
        return;
      }
      if (!this.isEdit) {
        this.saveAdd(payload.returnData.contentId, payload.returnData.metadata.title, payload.returnData.metadata.mainLibrary);
      } else {
        this.saveUpdate(payload.returnData.contentId, payload.returnData.metadata.title, payload.returnData.metadata.mainLibrary);
      }
      this.saveSuccessResolve(true);
    }
    if (payload.key === 'csrfTokenEditor'){
      //console.log('2.csrfToken');
      let lessonId = this.route.snapshot.paramMap.get('lessonId');
      if (lessonId !== 'new') {
        //alert('đây là trang editor cơ mà' + lessonId);
        this.loadLesson(lessonId);
      } else {
        this.setH5PContentId('new');
      }
    }
  }
  saveAdd(contentId, name, mainLibrary) {
    this.dataItem.code = contentId;
    this.dataItem.name = name;
    this.dataItem.mainLibrary = mainLibrary;
    this.generalService.addBaiGiang(this.dataItem).subscribe(res => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Tạo bài giảng thành công');
      this.dataIsSaved = true;
      this.router.navigate(['/teacher/teacher-course', this.courseId, this.dataKhoaHoc ? this.dataKhoaHoc.name : 'khoa-hoc-name']);
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật bài giảng thất bại: ' + error);
    });
  }
  saveUpdate(contentId, name, mainLibrary) {
    this.dataItem.code = contentId;
    this.dataItem.name = name;
    this.dataItem.mainLibrary = mainLibrary;
    this.generalService.updateBaiGiang(this.dataItem).subscribe(res => {
      this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật bài giảng thành công');
      this.dataIsSaved = true;
      this.router.navigate(['/teacher/teacher-course', this.courseId, this.dataKhoaHoc ? this.dataKhoaHoc.name : 'khoa-hoc-name']);
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật bài giảng thất bại: ' + error);
    });
  }
  async loginH5P() {
    const user = await this.authService.getUser();
    setTimeout(() => {
      if (this.h5pFrame && this.h5pFrame.contentWindow) {
        this.h5pFrame.contentWindow.postMessage({
          type: 'doLoginEditor', userId: user.data.id
        }, '*');
      }
    }, 0);
  }

  setH5PContentId(contentId){
    if (this.h5pFrame) {
      this.h5pFrame.contentWindow.postMessage({type: 'setContentId', contentId}, '*');
    }
  }
  removeMessageListener() {
    let i = window.removeEventListener('message', this.messageHandler, false);
  }
  ngOnDestroy() {
    this.removeMessageListener();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  setCurrentScrollBottom(scrollBottom){
    if (this.h5pFrame) {
      this.h5pFrame.contentWindow.postMessage({type: 'whenParentScroll', scrollBottom}, '*');
    }
  }
  onScroll($event: Event) {
    const scrollElement = this.scrollDiv.nativeElement;
    // Tính toán scrollBottom
    const scrollBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
    this.scrollSubject.next(scrollBottom);
  }
}
