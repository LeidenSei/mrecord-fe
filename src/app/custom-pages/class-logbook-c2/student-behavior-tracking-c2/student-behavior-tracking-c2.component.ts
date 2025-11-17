import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { AuthService } from 'src/app/services';
import { GeneralService } from 'src/app/services/general.service';
import { StudentTrackingService } from 'src/app/services/student-tracking.service';

interface StudentTrackingRow {
  id?: string;
  stt: number;
  studentId: string;
  studentCode: string;
  studentName: string;
  dateOfBirth?: Date;
  gender?: string;
  trackingNote?: string;
  trackingDate?: Date;
  period?: string;
  priority?: string;
  category?: string;
  intervention?: string;
  result?: string;
  dateCreated?: Date;
}

@Component({
  selector: 'app-student-behavior-tracking-c2',
  templateUrl: './student-behavior-tracking-c2.component.html',
  styleUrls: ['./student-behavior-tracking-c2.component.scss']
})
export class StudentBehaviorTrackingC2Component implements OnInit, OnDestroy {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;

  datas: StudentTrackingRow[] = [];
  students: any[] = [];
  trackingRecords: any[] = [];

  // Filter sources
  gradeSource = [];
  classSource = [];
  filterClassSource = [];

  // Selected filters
  filterGrade: any;
  filterClassId: any;

  // User info
  currentSchoolId: string = '';
  currentSchoolYear: number = new Date().getFullYear();

  // Popup
  popupVisible = false;
  popupTitle = 'Thêm theo dõi biểu hiện';
  isEditMode = false;

  // Form data
  selectedStudent: any;
  formData = {
    id: null,
    studentId: '',
    period: '',
    trackingNote: '',
    intervention: '',
    result: '',
    category: '',
    priority: '',
    dateCreated: null
  };

  // Dropdown sources
  periodSource = [
    { id: 'HK1', name: 'Học kỳ I' },
    { id: 'HK2', name: 'Học kỳ II' },
    { id: 'CA_NAM', name: 'Cả năm' }
  ];

  prioritySource = [
    { id: 'THAP', name: 'Thấp' },
    { id: 'TRUNG_BINH', name: 'Trung bình' },
    { id: 'CAO', name: 'Cao' },
    { id: 'RAT_CAO', name: 'Rất cao' }
  ];

  categorySource = [
    { id: 'HOC_TAP', name: 'Học tập' },
    { id: 'REN_LUYEN', name: 'Rèn luyện' },
    { id: 'SUC_KHOE', name: 'Sức khỏe' },
    { id: 'TAM_LY', name: 'Tâm lý' },
    { id: 'KHAC', name: 'Khác' }
  ];

  isLoading = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private generalService: GeneralService,
    private studentTrackingService: StudentTrackingService
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
            this.loadData();
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
      this.loadData();
    }
  }

  classChange($event: any): void {
    this.filterClassId = $event.itemData.id;
    this.loadData();
  }

  private loadData(): void {
    if (!this.filterClassId) {
      this.datas = [];
      return;
    }

    this.isLoading = true;

    // Only load tracking records - no need to load all students
    // Backend already returns student info in tracking records
    this.studentTrackingService.getListByClass(this.filterClassId, this.currentSchoolYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trackingRecords) => {
          this.trackingRecords = trackingRecords || [];
          this.buildDataSource();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          notify('Có lỗi khi tải dữ liệu', 'error', 3000);
          this.isLoading = false;
        }
      });
  }

  private buildDataSource(): void {
    // Only show students with tracking records
    this.datas = this.trackingRecords.map((record, index) => ({
      stt: index + 1,
      id: record.id,
      studentId: record.studentId,
      studentCode: record.mA_HOC_SINH || '',
      studentName: record.teN_HOC_SINH || '',
      dateOfBirth: null, // Not available in tracking record
      gender: null, // Not available in tracking record
      trackingNote: record.vaN_DE_QUAN_TAM || '',
      trackingDate: record.dateCreated,
      period: record.moC_THOI_GIAN || '',
      priority: record.muC_DO_UU_TIEN || '',
      category: record.danH_MUC || '',
      intervention: record.bieN_PHAP_CAN_THIEP || '',
      result: record.keT_QUA_SAU_CAN_THIEP || '',
      dateCreated: record.dateCreated
    }));
  }

  onAddNew(): void {
    this.isEditMode = false;
    this.popupTitle = 'Thêm theo dõi biểu hiện';
    this.selectedStudent = null;
    this.formData = {
      id: null,
      studentId: '',
      period: '',
      trackingNote: '',
      intervention: '',
      result: '',
      category: '',
      priority: '',
      dateCreated: null
    };

    // Load students list when opening popup
    if (!this.students || this.students.length === 0) {
      this.generalService.getListStudentByClass(this.filterClassId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (students) => {
            this.students = students || [];
          },
          error: (error) => {
            console.error('Error loading students:', error);
            notify('Có lỗi khi tải danh sách học sinh', 'error', 3000);
          }
        });
    }

    this.popupVisible = true;
  }

  onEdit(data: StudentTrackingRow): void {
    if (!data.id) {
      // No tracking record yet, create new
      this.onAddNew();
      return;
    }

    this.isEditMode = true;
    this.popupTitle = 'Cập nhật theo dõi biểu hiện';
    this.formData = {
      id: data.id,
      studentId: data.studentId,
      period: data.period || '',
      trackingNote: data.trackingNote || '',
      intervention: data.intervention || '',
      result: data.result || '',
      category: data.category || '',
      priority: data.priority || '',
      dateCreated: data.dateCreated
    };
    this.popupVisible = true;
  }

  onDelete(data: StudentTrackingRow): void {
    if (!data.id) {
      notify('Không có dữ liệu để xóa', 'warning', 2000);
      return;
    }

    const result = confirm(
      `Bạn có chắc chắn muốn xóa theo dõi của học sinh ${data.studentName}?`,
      'Xác nhận xóa'
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        this.studentTrackingService.delete(data.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              notify('Xóa thành công', 'success', 2000);
              this.loadData();
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
    if (!this.formData.studentId) {
      notify('Vui lòng chọn học sinh', 'warning', 2000);
      return;
    }

    if (!this.formData.trackingNote || !this.formData.trackingNote.trim()) {
      notify('Vui lòng nhập biểu hiện đáng chú ý', 'warning', 2000);
      return;
    }

    this.isSaving = true;

    const dataToSave = {
      ClassId: this.filterClassId,
      StudentId: this.formData.studentId,
      MA_NAM_HOC: this.currentSchoolYear,
      MOC_THOI_GIAN: this.formData.period,
      VAN_DE_QUAN_TAM: this.formData.trackingNote,
      BIEN_PHAP_CAN_THIEP: this.formData.intervention,
      KET_QUA_SAU_CAN_THIEP: this.formData.result,
      DANH_MUC: this.formData.category,
      MUC_DO_UU_TIEN: this.formData.priority,
      DateCreated: this.formData.dateCreated
    };

    const saveObservable = this.isEditMode
      ? this.studentTrackingService.update(dataToSave)
      : this.studentTrackingService.create(dataToSave);

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
          this.loadData();
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

  formatGender(gender: any): string {
    if (!gender) return '';
    if (gender === 'M' || gender === 'Nam' || gender === '1' || gender === 1) return 'Nam';
    if (gender === 'F' || gender === 'Nữ' || gender === 'Nu' || gender === '0' || gender === 0) return 'Nữ';
    return gender;
  }

  getPriorityName(id: string): string {
    const item = this.prioritySource.find(p => p.id === id);
    return item ? item.name : '';
  }

  getCategoryName(id: string): string {
    const item = this.categorySource.find(c => c.id === id);
    return item ? item.name : '';
  }

  getPeriodName(id: string): string {
    const item = this.periodSource.find(p => p.id === id);
    return item ? item.name : '';
  }

  getStudentDisplayExpr = (item: any): string => {
    if (!item) return '';
    const name = item.name || item.teN_HOC_SINH || '';
    const code = item.code || item.mA_HOC_SINH || '';
    return name + (code ? ' (' + code + ')' : '');
  }
}
