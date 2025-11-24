import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';
import { AuthService } from 'src/app/services';
import { GeneralService } from 'src/app/services/general.service';
import { ClassCommentService } from 'src/app/services/class-comment.service';

interface ClassCommentRow {
  id?: string;
  loai?: string;
  classId?: string;
  className?: string;
  schoolYear?: number;
  semester?: number;
  ngayGhi?: Date;
  tieuDe?: string;
  noiDung?: string;
  mucDoUuTien?: string;
  trangThai?: string;
  tenHocSinhLienQuan?: string;
  hanhDongCanThiet?: string;
  ngayTheoDoi?: Date;
  nguoiTao?: string;
  tenNguoiTao?: string;
  dateCreated?: Date;
  dateUpdated?: Date;
}

@Component({
  selector: 'app-principal-comments-c2',
  templateUrl: './principal-comments-c2.component.html',
  styleUrls: ['./principal-comments-c2.component.scss']
})
export class PrincipalCommentsC2Component implements OnInit, OnDestroy {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;

  datas: ClassCommentRow[] = [];

  // Filter sources
  gradeSource = [];
  classSource = [];
  filterClassSource = [];
  typeSource = [
    { value: '', name: 'Tất cả' },
    { value: 'comment', name: 'Nhận xét' },
    { value: 'note', name: 'Ghi chú' },
    { value: 'warning', name: 'Cảnh báo' }
  ];

  prioritySource = [
    { value: 'high', name: 'Cao' },
    { value: 'medium', name: 'Trung bình' },
    { value: 'low', name: 'Thấp' }
  ];

  statusSource = [
    { value: 'new', name: 'Mới' },
    { value: 'progress', name: 'Đang xử lý' },
    { value: 'resolved', name: 'Đã giải quyết' },
    { value: 'monitoring', name: 'Theo dõi' }
  ];

  // Selected filters
  filterGrade: any = null;
  filterClassId: any = null;
  filterType: string = '';

  // User info
  currentSchoolId: string = '';
  currentSchoolYear: number = new Date().getFullYear();

  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private generalService: GeneralService,
    private classCommentService: ClassCommentService
  ) {}

  async ngOnInit() {
    await this.initializeData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeData() {
    try {
      const user = await this.authService.getUser();
      this.currentSchoolId = user.data.schoolId;
      this.currentSchoolYear = user.data.schoolYear || new Date().getFullYear();

      // Load both grades and classes
      this.generalService.getListGradeOfSchool(this.currentSchoolId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (gradeSource) => {
            this.gradeSource = gradeSource;
            this.filterGrade = this.gradeSource[0];
          },
          error: (error) => {
            console.error('Error loading grades:', error);
            notify('Có lỗi khi tải dữ liệu khối', 'error', 3000);
          }
        });

      this.generalService.getListClassBySchool(this.currentSchoolId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (classSource) => {
            this.classSource = classSource;

            if (this.filterGrade) {
              this.filterClassSource = this.classSource.filter(en => en.grade === this.filterGrade);
            } else {
              this.filterClassSource = this.classSource;
            }

            // Mặc định chọn lớp đầu tiên
            this.filterClassId = this.filterClassSource.length > 0 ? this.filterClassSource[0].id : null;
            this.loadData();
          },
          error: (error) => {
            console.error('Error loading classes:', error);
            notify('Có lỗi khi tải dữ liệu lớp', 'error', 3000);
          }
        });
    } catch (error) {
      console.error('Error in initialization:', error);
      notify('Có lỗi khi khởi tạo', 'error', 3000);
    }
  }

  gradeChange($event: any): void {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = this.classSource;
    }

    // Mặc định chọn lớp đầu tiên
    this.filterClassId = this.filterClassSource.length > 0 ? this.filterClassSource[0].id : null;
    this.loadData();
  }

  classChange($event: any): void {
    this.filterClassId = $event.value;
    this.loadData();
  }

  typeChange($event: any): void {
    this.filterType = $event.value;
    this.loadData();
  }

  private loadData(): void {
    if (!this.filterClassId) {
      this.datas = [];
      return;
    }

    this.isLoading = true;

    this.classCommentService.getListByClass(
      this.filterClassId,
      this.currentSchoolYear,
      this.filterType
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.datas = (data || []).map((item: any) => ({
          id: item.id,
          loai: item.loai || item.LOAI,
          classId: item.classId,
          className: item.tenLop || item.teN_LOP || item.TEN_LOP,
          schoolYear: item.maNamHoc || item.mA_NAM_HOC || item.MA_NAM_HOC,
          semester: item.hocKy || item.hoC_KY || item.HOC_KY,
          ngayGhi: item.ngayGhi || item.ngaY_GHI || item.NGAY_GHI,
          tieuDe: item.tieuDe || item.tieU_DE || item.TIEU_DE,
          noiDung: item.noiDung || item.noI_DUNG || item.NOI_DUNG,
          mucDoUuTien: item.mucDoUuTien || item.muC_DO_UU_TIEN || item.MUC_DO_UU_TIEN,
          trangThai: item.trangThai || item.tranG_THAI || item.TRANG_THAI,
          tenHocSinhLienQuan: item.tenHocSinhLienQuan || item.teN_HOC_SINH_LIEN_QUAN || item.TEN_HOC_SINH_LIEN_QUAN,
          hanhDongCanThiet: item.hanhDongCanThiet || item.hanH_DONG_CAN_THIET || item.HANH_DONG_CAN_THIET,
          ngayTheoDoi: item.ngayTheoDoi || item.ngaY_THEO_DOI || item.NGAY_THEO_DOI,
          nguoiTao: item.nguoiTao || item.nguoI_TAO || item.NGUOI_TAO,
          tenNguoiTao: item.tenNguoiTao || item.teN_NGUOI_TAO || item.TEN_NGUOI_TAO,
          dateCreated: item.dateCreated,
          dateUpdated: item.dateUpdated
        }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        notify('Có lỗi khi tải dữ liệu', 'error', 3000);
        this.isLoading = false;
      }
    });
  }

  onRefresh(): void {
    this.loadData();
  }

  onInitNewRow(e: any): void {
    // Set default values for new row
    e.data.classId = this.filterClassId;
    e.data.ngayGhi = new Date();
    e.data.noiDung = '';
  }

  onRowInserting(e: any): void {
    // Create payload for insert
    const payload = {
      ClassId: e.data.classId,
      MA_NAM_HOC: this.currentSchoolYear,
      HOC_KY: 1, // Default semester
      NGAY_GHI: e.data.ngayGhi,
      TIEU_DE: 'Nhận xét của BGH',
      NOI_DUNG: e.data.noiDung,
      LOAI: 'comment'
    };

    // Cancel the default insert operation
    e.cancel = new Promise<void>((resolve, reject) => {
      this.classCommentService.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notify('Thêm nhận xét thành công', 'success', 2000);
            this.loadData();
            resolve();
          },
          error: (error) => {
            console.error('Error creating:', error);
            notify('Có lỗi khi thêm nhận xét', 'error', 3000);
            reject(error);
          }
        });
    });
  }

  onRowUpdating(e: any): void {
    // Merge old and new data
    const updatedData = { ...e.oldData, ...e.newData };

    // Create payload for update
    const payload = {
      ClassId: updatedData.classId,
      MA_NAM_HOC: this.currentSchoolYear,
      HOC_KY: 1,
      NGAY_GHI: updatedData.ngayGhi,
      TIEU_DE: 'Nhận xét của BGH',
      NOI_DUNG: updatedData.noiDung,
      LOAI: 'comment',
      DateCreated: updatedData.dateCreated
    };

    // Cancel the default update operation
    e.cancel = new Promise<void>((resolve, reject) => {
      this.classCommentService.update(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notify('Cập nhật nhận xét thành công', 'success', 2000);
            this.loadData();
            resolve();
          },
          error: (error) => {
            console.error('Error updating:', error);
            notify('Có lỗi khi cập nhật nhận xét', 'error', 3000);
            reject(error);
          }
        });
    });
  }

  onRowRemoving(e: any): void {
    // Cancel the default delete operation
    e.cancel = new Promise<void>((resolve, reject) => {
      this.classCommentService.delete(e.data.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notify('Xóa nhận xét thành công', 'success', 2000);
            this.loadData();
            resolve();
          },
          error: (error) => {
            console.error('Error deleting:', error);
            notify('Có lỗi khi xóa nhận xét', 'error', 3000);
            reject(error);
          }
        });
    });
  }

  customizePriorityText(cellInfo: any): string {
    const priority = cellInfo.value;
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return priority || '';
    }
  }

  customizeStatusText(cellInfo: any): string {
    const status = cellInfo.value;
    switch (status) {
      case 'new':
        return 'Mới';
      case 'progress':
        return 'Đang xử lý';
      case 'resolved':
        return 'Đã giải quyết';
      case 'monitoring':
        return 'Theo dõi';
      default:
        return status || '';
    }
  }

  customizeTypeText(cellInfo: any): string {
    const type = cellInfo.value;
    switch (type) {
      case 'comment':
        return 'Nhận xét';
      case 'note':
        return 'Ghi chú';
      case 'warning':
        return 'Cảnh báo';
      default:
        return type || '';
    }
  }
}
