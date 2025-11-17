import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { AuthService } from 'src/app/services';
import { GeneralService } from 'src/app/services/general.service';
import { ClassCooperationActivityService, ClassCooperationActivity } from 'src/app/services/class-cooperation-activity.service';

@Component({
  selector: 'app-activities-c2',
  templateUrl: './activities-c2.component.html',
  styleUrls: ['./activities-c2.component.scss']
})
export class ActivitiesC2Component implements OnInit, OnDestroy {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;

  datas: ClassCooperationActivity[] = [];

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
  popupTitle = 'Thêm hoạt động phối hợp';
  isEditMode = false;

  // Form data
  formData: ClassCooperationActivity = {
    classId: '',
    schoolYear: new Date().getFullYear(),
    term: 1,
    activityDate: new Date() as Date,
    cooperationTarget: '',
    activityContent: '',
    note: ''
  };

  isLoading = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private generalService: GeneralService,
    private activityService: ClassCooperationActivityService
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

    this.activityService.getListByClass(this.filterClassId, this.currentSchoolYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities) => {
          this.datas = activities || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          notify('Có lỗi khi tải dữ liệu', 'error', 3000);
          this.isLoading = false;
        }
      });
  }

  onAddNew(): void {
    this.isEditMode = false;
    this.popupTitle = 'Thêm hoạt động phối hợp';
    this.formData = {
      classId: this.filterClassId,
      schoolId: this.currentSchoolId,
      schoolYear: this.currentSchoolYear,
      term: 1,
      activityDate: new Date() as Date,
      cooperationTarget: '',
      activityContent: '',
      note: ''
    };
    this.popupVisible = true;
  }

  onEdit(data: ClassCooperationActivity): void {
    this.isEditMode = true;
    this.popupTitle = 'Cập nhật hoạt động phối hợp';
    this.formData = {
      id: data.id,
      classId: data.classId,
      schoolId: data.schoolId,
      schoolYear: data.schoolYear,
      term: data.term,
      activityDate: data.activityDate ? new Date(data.activityDate) : new Date(),
      cooperationTarget: data.cooperationTarget || '',
      activityContent: data.activityContent || '',
      note: data.note || ''
    };
    this.popupVisible = true;
  }

  onDelete(data: ClassCooperationActivity): void {
    if (!data.id) {
      notify('Không có dữ liệu để xóa', 'warning', 2000);
      return;
    }

    const result = confirm(
      `Bạn có chắc chắn muốn xóa hoạt động này?`,
      'Xác nhận xóa'
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        this.activityService.delete(data.id)
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
    if (!this.formData.activityDate) {
      notify('Vui lòng chọn ngày, tháng, năm', 'warning', 2000);
      return;
    }

    if (!this.formData.cooperationTarget || !this.formData.cooperationTarget.trim()) {
      notify('Vui lòng nhập đối tượng phối hợp', 'warning', 2000);
      return;
    }

    if (!this.formData.activityContent || !this.formData.activityContent.trim()) {
      notify('Vui lòng nhập nội dung hoạt động', 'warning', 2000);
      return;
    }

    this.isSaving = true;

    const dataToSave: ClassCooperationActivity = {
      id: this.formData.id,
      classId: this.formData.classId,
      schoolId: this.currentSchoolId,
      schoolYear: this.currentSchoolYear,
      term: this.formData.term || 1,
      activityDate: this.formData.activityDate,
      cooperationTarget: this.formData.cooperationTarget,
      activityContent: this.formData.activityContent,
      note: this.formData.note
    };

    const saveObservable = this.isEditMode
      ? this.activityService.update(dataToSave)
      : this.activityService.create(dataToSave);

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
}
