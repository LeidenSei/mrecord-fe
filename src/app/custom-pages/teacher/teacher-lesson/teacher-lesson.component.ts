import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {forkJoin} from 'rxjs';
import {DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {Constant} from "../../../shared/constants/constant.class";
import {confirm, custom} from "devextreme/ui/dialog";
import {DxFileUploaderComponent, DxValidationGroupComponent} from "devextreme-angular";
import {Location} from "@angular/common";
import { DxSortableTypes } from 'devextreme-angular/ui/sortable';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DxListModule } from 'devextreme-angular';

type DxoItemDraggingProperties = DxSortableTypes.Properties;
@Component({
  selector: 'app-teacher-lesson',
  templateUrl: './teacher-lesson.component.html',
  styleUrls: ['./teacher-lesson.component.scss']
})
export class TeacherLessonComponent implements OnInit {
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  uploadScormUrl = this.configService.getConfig().api.baseUrl + '/file/uploadscormfile';
  datas = [];
  courseTitle = '';
  courseId: any;
  isShowUploadTaiLieu = false;
  taiLieuItem: any;
  uploadHeaders: any;
  user: any;
  isEdit = true;
  baiGiangItem: any;
  isShowComment = false;

  khoaHocItem: any;
  currentYear: number;
  showTrangThaiDuyet = false;
  isShowModalSorting = false;
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  @ViewChild("dropzone_external", {static: false}) dropZoneElement: ElementRef;
  @ViewChild("fileUploader", {static: false}) fileUploader: DxFileUploaderComponent;

  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private location: Location,
              private notificationService: NotificationService,
              private configService: AppConfigService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };
    this.taiLieuItem = {
      riengTu: false,
      trangThai: 0,
      code: '',
      phan: 1,
      view: 0
    };
    this.baiGiangItem = {};
  }

  ngAfterViewInit() {
    //alert(this.h5pUrl);
  }

  async ngOnInit() {
    let courseTitle = this.route.snapshot.paramMap.get('courseTitle');
    if (courseTitle) {
      this.courseTitle = courseTitle;
    }
    this.user = await this.authService.getUser();
    this.currentYear = this.user.data.currentYear;

    forkJoin([
      this.generalService.getSchool(this.user.data.schoolId),
    ]).subscribe(([school]) => {
      this.showTrangThaiDuyet  = school.lmsApproveLevel > 0;
      /*if (this.user.data.toTruongMon && this.user.data.toTruongMon.length) {
        this.hasRoleTTCM = true;
      }*/

      this.courseId = this.route.snapshot.paramMap.get('courseId');
      this.taiLieuItem.khoaHocId = this.courseId;
      this.taiLieuItem.schoolId = this.user.data.schoolId;
      this.taiLieuItem.accountId = this.user.data.id;
      this.taiLieuItem.accountType = this.user.data.role;

      this.loadGrid();
      this.loadCourse();
    });
  }
  loadCourse(){
    this.generalService.getKhoaHoc(this.courseId).subscribe(res => {
      this.isEdit = res.accountId === this.user.data.id;
      this.khoaHocItem = res;
    }, error => {
    });
  }
  async loadGrid() {
    const user = await this.authService.getUser();
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.generalService.getLessonByCourse(this.courseId).subscribe(res => {
      this.datas = res;
      console.log('res', res);
      let index = 1;
      this.datas.forEach(en => {
        en.stt = index++;
        en.giaiDoan = this.toGiaiDoan(en.phan);
      });
    }, error => {
    });
  }

  addItemClick() {
    /*this.isShowEdit = true;
    this.formUpdateReset();
    this.initUploadTrigger();
    this.khoaHocvalidationGroup.instance.reset();
    /:courseId/:lessonId
    */
    this.router.navigate(['/teacher/lesson-editor', this.courseId, 'new']);
  }

  onEditClick = async (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    let data = e.row.data;
    if (data.loaiHocLieu == 2) {
      this.router.navigate(['/teacher/lesson-editor', this.courseId, data.id]);
    } else {
      this.fileUploader.showFileList = true;
      let item = await this.generalService.getTaiLieu(data.id).toPromise();
      this.isShowUploadTaiLieu = true;
      this.taiLieuItem = item;
      //this.notificationService.showNotification(Constant.WARNING, 'Chức năng sửa không áp dụng cho tài liệu.');
    }
  }
  getFileName(path: string){
    if (path) {
      const parts = path.split('/');
      return parts.pop() || '';
    } else return '';
  }
  onViewClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.viewDetail(e.row.data);
  }
  onDeleteClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    let data = e.row.data;
    console.log(data);
    if (data.loaiHocLieu === 2) {
      const result = confirm(`Bạn có chắc chắn muốn xóa bài giảng: <strong>${data.name}</strong> này?`, 'Xác nhận xóa');
      result.then((dialogResult) => {
        if (dialogResult) {
          this.generalService.deleteBaiGiang(data.id).subscribe(en => {
            if (en.code > 0){
              this.notificationService.showNotification(Constant.WARNING, en.message);
            } else {
              this.notificationService.showNotification(Constant.SUCCESS, 'Xóa bài giảng thành công');
              this.loadGrid();
            }
          }, error => {

          });
        }
      });
    } else {
      const result = confirm(`Bạn có chắc chắn muốn xóa tài liệu: <strong>${data.name}</strong> này?`, 'Xác nhận xóa');
      result.then((dialogResult) => {
        if (dialogResult) {
          this.generalService.deleteTaiLieu(data.id).subscribe(en => {
            this.notificationService.showNotification(Constant.SUCCESS, 'Xóa tài liệu thành công');
            this.loadGrid();
          }, error => {

          });
        }
      });
    }
  };

  isUploadTailieuValid() {
    return this.validationGroup.instance.validate().isValid;
  }

  back() {
    /*if (this.hasRoleTTCM) {
      this.router.navigate(['/teacher/approval-course']);
    } else {
      this.router.navigate(['/teacher/teacher-course']);
    }*/
    //this.location.back();
    this.router.navigate(['/teacher/teacher-course']);
  }

  changeRiengTu(item, $event) {
    let updateItem = Object.assign({}, item);
    updateItem.riengTu = $event;
    console.log(updateItem);
    if (updateItem.loaiHocLieu === 2) {
      this.generalService.updateBaiGiang(updateItem).subscribe(res => {
        if (res) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật quyền riêng tư thành công');
          this.loadGrid();
        }
      }, error => {
        this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ');
      });
    } else {
      this.generalService.updateTaiLieu(updateItem).subscribe(res => {
        if (res) {
          this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật quyền riêng tư thành công');
          this.loadGrid();
        }
      }, error => {
        this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ');
      });
    }
  }

  viewDetail(data: any) {
    if (data.loaiHocLieu === 2) {
      this.router.navigate(['/teacher/lesson-player', this.courseId, data.id, 2]);
    } else {
      this.router.navigate(['/teacher/lesson-player', this.courseId, data.id, 1]);
    }
  }

  addTaiLieuClick() {
    this.isShowUploadTaiLieu = true;
    this.taiLieuItem = {
      riengTu: false,
      trangThai: 0,
      code: '',
      phan: 1,
      view: 0
    };
    this.taiLieuItem.khoaHocId = this.courseId;
    this.taiLieuItem.schoolId = this.user.data.schoolId;
    this.taiLieuItem.accountId = this.user.data.id;
    this.taiLieuItem.accountType = this.user.data.role;

    this.fileUploader.showFileList = false;
    this.initUploadTrigger();
  }

  closePopupEditTaiLieu() {
    this.isShowUploadTaiLieu = false;
  }

  onUploadTaiLieuStarted(e: any) {
    console.log('Upload started:', e);
    const item = e.file;
    const fileName = item.name;
    const parts = fileName.split('.');
    let fileExt = parts.length > 1 ? parts.pop() : '';
    return false;
  }

  onTaiLieuUploaded(e: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      this.taiLieuItem.url = res.url;
      this.fileUploader.showFileList = true;
    }
    // Thực hiện các hành động tùy chỉnh khi upload hoàn tất
  }

  onTaiLieuUploadError(e: any) {
    console.error('Upload error:', e);
    // Thực hiện các hành động tùy chỉnh khi upload gặp lỗi
  }

  onSaveTaiLieuClick() {
    if (this.isUploadTailieuValid()) {
      this.saveTaiLieu();
    } else {
      this.notificationService.showNotification(Constant.ERROR, 'Có trường dữ liệu bắt buộc chưa nhập');
    }
  }

  saveTaiLieu() {
    if (!this.taiLieuItem.id) {
      this.generalService.addTaiLieu(this.taiLieuItem).subscribe(res => {
        this.isShowUploadTaiLieu = false;
        this.notificationService.showNotification(Constant.SUCCESS, 'Thêm mới tài liệu thành công');
        this.loadGrid();
      }, error => {
        this.notificationService.showNotification(Constant.ERROR, 'Thêm mới tài liệu thất bại: ' + error);
      });
    } else {
      this.generalService.updateTaiLieu(this.taiLieuItem).subscribe(res => {
        this.isShowUploadTaiLieu = false;
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật tài liệu thành công');
        this.loadGrid();
      }, error => {
        this.notificationService.showNotification(Constant.ERROR, 'Cập nhật tài liệu thất bại: ' + error);
      });
    }
  }
  viewNote(data: any) {
    this.baiGiangItem = data;
    this.isShowComment = true;
  }
  private initUploadTrigger() {
    console.log(this.dropZoneElement);
    /*this.fileUploader.instance.option({
      dropZone: this.dropZoneElement.nativeElement,
      dialogTrigger: this.dropZoneElement.nativeElement
    });*/
  }
  allowEdit(){
    return this.currentYear === this.khoaHocItem?.schoolYear || this.khoaHocItem?.schoolYear === 0;
  }
  toGiaiDoan(phan){
    switch (phan) {
      case 1:
        return 'Tự nghiên cứu';
      case 3:
        return 'Hoạt động trên lớp';
      case 2:
        return 'Kiểm tra đánh giá';
    }
    return '';
  }

  fixTyLeHoanThanh() {
    let payload = {
      khoaHocId: this.khoaHocItem.id,
      schoolId: this.user.data.schoolId
    }
    const dialog = custom({
      title: 'Xác nhận',
      messageHtml: `Bạn có chắc muốn cập nhật lại tỷ lệ hoàn thành cho khóa học này không`,
      buttons: [
        {
          text: 'Đồng ý',
          type: 'success',
          stylingMode: 'outlined',
          onClick: () => {
            this.generalService.fixKetQuaBaiGiang(payload).subscribe(res => {
              if (res.code === 0) {
                this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật tỷ lệ thành công');
              } else {
                this.notificationService.showNotification(Constant.ERROR, res.message);
              }
            }, error => {
            });
            return {dialogResult: 'save'};  // Trả về đối tượng chứa giá trị dialogResult
          }
        },
        {
          text: 'Bỏ qua',
          stylingMode: 'outlined',
          onClick: () => {
            return {dialogResult: 'cancel'};  // Tương tự cho cancel
          }
        },
      ],
    });
    dialog.show();
  }

  showModalSorting() {
    this.isShowModalSorting = true;
  }

  onDragStart: DxoItemDraggingProperties['onDragStart'] = (e) => {
    e.itemData = e.fromData[e.fromIndex];
  };

  onAdd: DxoItemDraggingProperties['onAdd'] = (e) => {
    e.toData.splice(e.toIndex, 0, e.itemData);
  };

  onRemove: DxoItemDraggingProperties['onRemove'] = (e) => {
    e.fromData.splice(e.fromIndex, 1);
  };

  onReorder: DxoItemDraggingProperties['onReorder'] = (e) => {
    this.onRemove(e as DxSortableTypes.RemoveEvent);
    this.onAdd(e as DxSortableTypes.AddEvent);
    //console.log(this.datas.map(en => en.id));
  };

  onSaveSorting() {
    let payload = {
      khoaHocId: this.khoaHocItem.id,
      sortIds: this.datas.map(en => en.id)
    }
    this.generalService.setSortingHocLieu(payload).subscribe(res => {
      if (res.code === 0) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật thứ tự thành công');
        this.isShowModalSorting = false;
        this.loadGrid();
      } else {
        this.notificationService.showNotification(Constant.ERROR, res.message);
      }
    }, error => {
    });
  }

  closePopupSorting() {
    this.isShowModalSorting = false;
  }
}
