import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {forkJoin} from 'rxjs';
import {DxDataGridComponent, DxDataGridTypes} from "devextreme-angular/ui/data-grid";
import {Constant} from "../../../shared/constants/constant.class";
import {confirm, custom} from "devextreme/ui/dialog";
import {DxFileUploaderComponent, DxValidationGroupComponent} from "devextreme-angular";
import {Location} from "@angular/common";
import {DxSortableTypes} from 'devextreme-angular/ui/sortable';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {DxListModule} from 'devextreme-angular';

type DxoItemDraggingProperties = DxSortableTypes.Properties;

@Component({
  selector: 'app-teaching-plan',
  templateUrl: './teaching-plan.component.html',
  styleUrls: ['./teaching-plan.component.scss']
})
export class TeachingPlanComponent implements OnInit {
  uploadUrl = this.configService.getConfig().api.baseUrl + '/file/uploadFile';
  uploadScormUrl = this.configService.getConfig().api.baseUrl + '/file/uploadscormfile';
  datas = [];
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
  editSubjectSource = [];
  gradeSource = [];
  @ViewChild('validationGroup', {static: true}) validationGroup: DxValidationGroupComponent;

  @ViewChild("dropzone_external", {static: false}) dropZoneElement: ElementRef;
  @ViewChild("fileUploader", {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;
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

    this.user = await this.authService.getUser();
    this.currentYear = this.user.data.currentYear;

    forkJoin([
      this.generalService.getSchool(this.user.data.schoolId),
      this.generalService.getListGradeOfSchool(this.user.data.schoolId),
      this.generalService.getListSubjectBySchool(this.user.data.schoolId),
      this.generalService.getListSubjectByTeacher(this.user.data.schoolId, this.user.data.personId)
    ]).subscribe(([school, gradeSource, subjectSource, teacherSubjectSource]) => {
      this.showTrangThaiDuyet = school.lmsApproveLevel > 0;
      /*if (this.user.data.toTruongMon && this.user.data.toTruongMon.length) {
        this.hasRoleTTCM = true;
      }*/
      this.gradeSource = gradeSource;
      this.taiLieuItem.schoolId = this.user.data.schoolId;
      this.taiLieuItem.accountId = this.user.data.id;
      this.taiLieuItem.accountType = this.user.data.role;

      if (this.user.data.isBGH) {
        this.editSubjectSource = subjectSource;
      } else if (this.user.data.toTruongMon && this.user.data.toTruongMon.length) {
        const lstByTTCM = subjectSource.filter(en => this.user.data.toTruongMon.includes(en.id));
        const mergedList = lstByTTCM.concat(teacherSubjectSource);
        this.editSubjectSource = mergedList.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );
      } else {
        if (teacherSubjectSource.length) {
          this.editSubjectSource = teacherSubjectSource;
        } else {
          this.editSubjectSource = subjectSource;
        }
      }

      this.loadGrid();
    });
  }

  async loadGrid() {
    this.generalService.getMyTeachingPlan(this.user.data.schoolId).subscribe(res => {
      this.datas = res.items;
      console.log('res', res);
      let index = 1;
      this.datas.forEach(en => {
        en.stt = index++;
      });
    }, error => {
    });
  }

  addItemClick() {

  }

  onEditClick = async (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    let data = e.row.data;
    this.fileUploader.showFileList = true;
    let item = await this.generalService.getGiaoAn(data.id).toPromise();
    this.isShowUploadTaiLieu = true;
    this.taiLieuItem = item;
    //this.notificationService.showNotification(Constant.WARNING, 'Chức năng sửa không áp dụng cho giáo án.');
  }

  getFileName(path: string) {
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
    const result = confirm(`Bạn có chắc chắn muốn xóa giáo án: <strong>${data.name}</strong> này?`, 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.generalService.deleteGiaoAn(data.id).subscribe(en => {
          this.notificationService.showNotification(Constant.SUCCESS, 'Xóa giáo án thành công');
          this.loadGrid();
        }, error => {

        });
      }
    });
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
    this.generalService.updateGiaoAn(updateItem).subscribe(res => {
      if (res) {
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật quyền riêng tư thành công');
        this.loadGrid();
      }
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, 'Cập nhật thất bại: ');
    });
  }

  viewDetail(data: any) {
    console.log(data);
    window.open(data.url, '_blank');
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
    /*console.log('Upload started:', e);

    const item = e.file;
    const formData = new FormData();
    formData.append('formFile', item.file as any);

    this.generalService.upload(formData).subscribe(res => {
      console.log(formData);
    }, error => {
      this.notificationService.showNotification(Constant.ERROR, error.message.toString());
    });

    // Thực hiện các hành động tùy chỉnh khi upload bắt đầu*/
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
    if (!this.taiLieuItem.url){
      this.notificationService.showNotification(Constant.ERROR, 'Chưa chọn file giáo án để upload');
      return;
    }
    if (!this.taiLieuItem.id) {
      this.generalService.addGiaoAn(this.taiLieuItem).subscribe(res => {
        this.isShowUploadTaiLieu = false;
        this.notificationService.showNotification(Constant.SUCCESS, 'Thêm mới giáo án thành công');
        this.loadGrid();
      }, error => {
        this.notificationService.showNotification(Constant.ERROR, 'Thêm mới giáo án thất bại: ' + error);
      });
    } else {
      this.generalService.updateGiaoAn(this.taiLieuItem).subscribe(res => {
        this.isShowUploadTaiLieu = false;
        this.notificationService.showNotification(Constant.SUCCESS, 'Cập nhật giáo án thành công');
        this.loadGrid();
      }, error => {
        this.notificationService.showNotification(Constant.ERROR, 'Cập nhật giáo án thất bại: ' + error);
      });
    }
  }

  viewNote(data: any) {
    this.baiGiangItem = data;
    this.isShowComment = true;
  }

  private initUploadTrigger() {
    console.log(this.dropZoneElement);

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
  calculateSTT = (rowData: any) => {
    if (!this.dataGrid?.instance) return 1;

    const dataSource = this.dataGrid.instance.getVisibleRows(); // Lấy dữ liệu hiển thị
    const rowIndex = dataSource.findIndex(row => row.data === rowData); // Lấy index dựa trên dữ liệu

    const pageIndex = this.dataGrid.instance.pageIndex();
    const pageSize = this.dataGrid.instance.pageSize();

    return pageIndex * pageSize + rowIndex + 1;
  };
  getRowIndex(cellInfo: any): number {
    if (!cellInfo.component) return 1;

    const pageIndex = cellInfo.component.pageIndex(); // Trang hiện tại
    const pageSize = cellInfo.component.pageSize();   // Số bản ghi trên mỗi trang
    const visibleRows = cellInfo.component.getVisibleRows(); // Lấy danh sách hàng hiển thị

    // Lọc ra chỉ những hàng dữ liệu thực, bỏ qua hàng nhóm
    const filteredRows = visibleRows.filter(row => row.rowType === 'data');

    // Tìm chỉ số của hàng hiện tại trong danh sách hàng thực
    const rowIndex = filteredRows.findIndex(row => row.data === cellInfo.data);

    return pageIndex * pageSize + rowIndex + 1;
  }
}
