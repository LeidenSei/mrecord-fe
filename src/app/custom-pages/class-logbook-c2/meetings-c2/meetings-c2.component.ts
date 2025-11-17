import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { AuthService } from 'src/app/services';
import { GeneralService } from 'src/app/services/general.service';
import { ClassMeetingService, ClassMeeting, LoaiHoatDongLop } from 'src/app/services/class-meeting.service';

@Component({
  selector: 'app-meetings-c2',
  templateUrl: './meetings-c2.component.html',
  styleUrls: ['./meetings-c2.component.scss']
})
export class MeetingsC2Component implements OnInit, OnDestroy {
  @ViewChild('grid1', { static: false }) grid1: DxDataGridComponent;
  @ViewChild('grid2', { static: false }) grid2: DxDataGridComponent;

  // Tab data
  sinhHoatLopData: ClassMeeting[] = [];
  chuyenDeData: ClassMeeting[] = [];
  hopChuNhiemData: ClassMeeting[] = [];
  bienBanHopData: ClassMeeting[] = [];

  // Filter sources
  gradeSource = [];
  classSource = [];
  filterClassSource = [];

  // Selected filters
  filterGrade: any;
  filterClassId: any;

  // Term filter for tab 1 & 2
  termSource = [
    { id: 1, name: 'Học kỳ I' },
    { id: 2, name: 'Học kỳ II' }
  ];
  selectedTerm: number = 1;

  // Meeting times (for tab 4)
  lanHopSource = [
    { id: 1, name: 'Lần 1' },
    { id: 2, name: 'Lần 2' },
    { id: 3, name: 'Lần 3' },
    { id: 4, name: 'Lần 4' }
  ];

  // User info
  currentSchoolId: string = '';
  currentSchoolYear: number = new Date().getFullYear();

  // Current tab
  selectedTabIndex = 0;

  // Popup
  popupVisible = false;
  popupTitle = '';
  isEditMode = false;

  // Form data
  formData: ClassMeeting = this.getEmptyFormData();

  // Quill config
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, false] }],
      ['clean']
    ]
  };

  isLoading = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private generalService: GeneralService,
    private meetingService: ClassMeetingService
  ) {}

  async ngOnInit() {
    await this.initializeData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getEmptyFormData(): ClassMeeting {
    return {
      classId: '',
      schoolId: '',
      schoolYear: new Date().getFullYear(),
      loaiHoatDong: LoaiHoatDongLop.SinhHoatLop,
      tieuDe: '',
      noiDung: '',
      term: 1,
      week: 1,
      thoiGianHop: new Date() as any,
      diaDiem: '',
      lanHop: 1
    };
  }

  private async initializeData() {
    try {
      const user = await this.authService.getUser();
      this.currentSchoolId = user.data.schoolId;
      this.currentSchoolYear = user.data.schoolYear || new Date().getFullYear();

      forkJoin([
        this.generalService.getListGradeOfSchool(user.data.schoolId),
        this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([gradeSource, classSource]) => {
          this.gradeSource = gradeSource;
          this.classSource = classSource;

          this.filterGrade = this.gradeSource[0];
          if (this.filterGrade) {
            this.filterClassSource = this.classSource.filter(en => en.grade === this.filterGrade);
          } else {
            this.filterClassSource = this.classSource;
          }

          if (this.filterClassSource.length > 0) {
            this.filterClassId = this.filterClassSource[0].id;
            this.loadCurrentTabData();
          }
        },
        error: (error) => {
          console.error('Error loading initial data:', error);
          notify('Có lỗi khi tải dữ liệu ban đầu', 'error', 3000);
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

    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
      this.loadCurrentTabData();
    }
  }

  classChange($event: any): void {
    this.filterClassId = $event.itemData.id;
    this.loadCurrentTabData();
  }

  termChange($event: any): void {
    this.selectedTerm = $event.itemData.id;
    this.loadCurrentTabData();
  }

  onTabChanged(e: any): void {
    this.selectedTabIndex = e.component.option('selectedIndex');
    this.loadCurrentTabData();
  }

  private loadCurrentTabData(): void {
    switch (this.selectedTabIndex) {
      case 0:
        this.loadSinhHoatLop();
        break;
      case 1:
        this.loadChuyenDe();
        break;
      case 2:
        this.loadHopChuNhiem();
        break;
      case 3:
        this.loadBienBanHop();
        break;
    }
  }

  private loadSinhHoatLop(): void {
    if (!this.filterClassId) return;
    this.isLoading = true;

    this.meetingService.getSinhHoatLop(this.filterClassId, this.currentSchoolYear, this.selectedTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.sinhHoatLopData = data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          notify('Có lỗi khi tải dữ liệu', 'error', 3000);
          this.isLoading = false;
        }
      });
  }

  private loadChuyenDe(): void {
    if (!this.filterClassId) return;
    this.isLoading = true;

    this.meetingService.getChuyenDe(this.filterClassId, this.currentSchoolYear, this.selectedTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.chuyenDeData = data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          notify('Có lỗi khi tải dữ liệu', 'error', 3000);
          this.isLoading = false;
        }
      });
  }

  private loadHopChuNhiem(): void {
    if (!this.filterClassId) return;
    this.isLoading = true;

    this.meetingService.getHopChuNhiem(this.filterClassId, this.currentSchoolYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.hopChuNhiemData = data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          notify('Có lỗi khi tải dữ liệu', 'error', 3000);
          this.isLoading = false;
        }
      });
  }

  private loadBienBanHop(): void {
    if (!this.filterClassId) return;
    this.isLoading = true;

    this.meetingService.getBienBanHop(this.filterClassId, this.currentSchoolYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.bienBanHopData = data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          notify('Có lỗi khi tải dữ liệu', 'error', 3000);
          this.isLoading = false;
        }
      });
  }

  // Tab 1 & 2: Table operations
  onAddNewTable(): void {
    this.isEditMode = false;
    const loaiHoatDong = this.selectedTabIndex === 0 ? LoaiHoatDongLop.SinhHoatLop : LoaiHoatDongLop.ChuyenDe;
    this.popupTitle = this.selectedTabIndex === 0 ? 'Thêm sinh hoạt lớp' : 'Thêm chuyên đề';

    this.formData = {
      classId: this.filterClassId,
      schoolId: this.currentSchoolId,
      schoolYear: this.currentSchoolYear,
      loaiHoatDong: loaiHoatDong,
      term: this.selectedTerm,
      week: 1,
      tieuDe: '',
      thoiGianHop: new Date() as any,
      diaDiem: '',
      noiDung: ''
    };
    this.popupVisible = true;
  }

  onEditTable(data: ClassMeeting): void {
    this.isEditMode = true;
    this.popupTitle = this.selectedTabIndex === 0 ? 'Cập nhật sinh hoạt lớp' : 'Cập nhật chuyên đề';
    this.formData = { ...data };
    this.popupVisible = true;
  }

  onDeleteTable(data: ClassMeeting): void {
    if (!data.id) {
      notify('Không có dữ liệu để xóa', 'warning', 2000);
      return;
    }

    const result = confirm('Bạn có chắc chắn muốn xóa?', 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.meetingService.delete(data.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              notify('Xóa thành công', 'success', 2000);
              this.loadCurrentTabData();
            },
            error: (error) => {
              console.error('Error deleting:', error);
              notify('Có lỗi khi xóa', 'error', 3000);
            }
          });
      }
    });
  }

  // Tab 3 & 4: Editor operations
  onAddNewEditor(): void {
    this.isEditMode = false;
    const loaiHoatDong = this.selectedTabIndex === 2 ? LoaiHoatDongLop.HopChuNhiem : LoaiHoatDongLop.BienBanHop;
    this.popupTitle = this.selectedTabIndex === 2 ? 'Thêm họp chủ nhiệm' : 'Thêm biên bản họp';

    this.formData = {
      classId: this.filterClassId,
      schoolId: this.currentSchoolId,
      schoolYear: this.currentSchoolYear,
      loaiHoatDong: loaiHoatDong,
      tieuDe: '',
      noiDung: '',
      thoiGianHop: new Date() as any,
      lanHop: this.selectedTabIndex === 3 ? 1 : undefined
    };
    this.popupVisible = true;
  }

  onEditEditor(data: ClassMeeting): void {
    this.isEditMode = true;
    this.popupTitle = this.selectedTabIndex === 2 ? 'Cập nhật họp chủ nhiệm' : 'Cập nhật biên bản họp';
    this.formData = { ...data };
    this.popupVisible = true;
  }

  onDeleteEditor(data: ClassMeeting): void {
    if (!data.id) {
      notify('Không có dữ liệu để xóa', 'warning', 2000);
      return;
    }

    const result = confirm('Bạn có chắc chắn muốn xóa?', 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.meetingService.delete(data.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              notify('Xóa thành công', 'success', 2000);
              this.loadCurrentTabData();
            },
            error: (error) => {
              console.error('Error deleting:', error);
              notify('Có lỗi khi xóa', 'error', 3000);
            }
          });
      }
    });
  }

  onSave(): void {
    if (!this.formData.tieuDe || !this.formData.tieuDe.trim()) {
      notify('Vui lòng nhập tiêu đề', 'warning', 2000);
      return;
    }

    if (!this.formData.noiDung || !this.formData.noiDung.trim()) {
      notify('Vui lòng nhập nội dung', 'warning', 2000);
      return;
    }

    this.isSaving = true;

    const saveObservable = this.isEditMode
      ? this.meetingService.update(this.formData)
      : this.meetingService.create(this.formData);

    saveObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notify(
            this.isEditMode ? 'Cập nhật thành công' : 'Thêm mới thành công',
            'success',
            2000
          );
          this.popupVisible = false;
          this.loadCurrentTabData();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving:', error);
          notify('Có lỗi khi lưu dữ liệu', 'error', 3000);
          this.isSaving = false;
        }
      });
  }

  onCancel(): void {
    this.popupVisible = false;
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  }

  getTermName(term: number): string {
    return term === 1 ? 'Học kỳ I' : 'Học kỳ II';
  }

  getLanHopName(lan: number): string {
    return `Lần ${lan}`;
  }
}
