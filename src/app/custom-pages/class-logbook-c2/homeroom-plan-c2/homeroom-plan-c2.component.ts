import { Component, OnInit, OnDestroy } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { GeneralService } from 'src/app/services/general.service';
import { AuthService } from 'src/app/services';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KeHoachChuNhiem, KeHoachChuNhiemService } from 'src/app/services/homeroom-plan.service';

@Component({
  selector: 'app-homeroom-plan-c2',
  templateUrl: './homeroom-plan-c2.component.html',
  styleUrls: ['./homeroom-plan-c2.component.scss']
})
export class HomeroomPlanC2Component implements OnInit, OnDestroy {
  // Form data
  advantages = '';
  difficulties = '';
  yearlyRequirements = '';
  targets = '';
  mainSolutions = '';
  deepTopics = '';
  planAdjustments = '';

  currentKeHoachId: string | undefined;
  currentClassId: string = '';
  currentClassName: string = '';
  currentSchoolId: string = '';
  currentSchoolYear: number = new Date().getFullYear();

  gradeSource = [];
  classSource = [];
  filterClassSource = [];
  filterGrade: any;
  filterClassId: any;
  isLoading = false;
  isSaving = false;

  private saveTimeout: any;
  private destroy$ = new Subject<void>();

  // Quill editor config
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ]
  };

  constructor(
    private keHoachService: KeHoachChuNhiemService,
    private generalService: GeneralService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    await this.initializeData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
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

          // Auto select first class
          if (this.filterClassSource.length > 0) {
            this.filterClassId = this.filterClassSource[0].id;
            this.loadKeHoachData();
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
      this.loadKeHoachData();
    }
  }

  classChange($event: any): void {
    this.filterClassId = $event.itemData.id;
    this.loadKeHoachData();
  }

  private loadKeHoachData(): void {
    if (!this.filterClassId) {
      this.resetForm();
      return;
    }

    this.isLoading = true;
    const selectedClass = this.filterClassSource.find(c => c.id === this.filterClassId);
    this.currentClassName = selectedClass?.name || '';
    this.currentClassId = this.filterClassId;

    // Get plan for specific class
    this.keHoachService.getListBySchool(
      this.currentSchoolId,
      this.currentSchoolYear,
      1,
      1000,
      selectedClass?.name,
      0, // Semester = 0 cho kế hoạch năm
      undefined,
      undefined
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        // Find plan for current class
        const plan = result.items.find(item => item.classId === this.currentClassId);

        if (plan) {
          this.loadPlanToForm(plan);
        } else {
          this.resetForm();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading plan:', error);
        notify('Có lỗi khi tải kế hoạch', 'error', 2000);
        this.isLoading = false;
      }
    });
  }

  private loadPlanToForm(plan: any): void {
    this.currentKeHoachId = plan.id;
    this.advantages = plan.advantages || '';
    this.difficulties = plan.difficulties || '';
    this.yearlyRequirements = plan.yearlyRequirements || '';
    this.targets = plan.targets || '';
    this.mainSolutions = plan.mainSolutions || '';
    this.deepTopics = plan.deepTopics || '';
    this.planAdjustments = plan.planAdjustments || '';
  }

  private resetForm(): void {
    this.currentKeHoachId = undefined;
    this.advantages = '';
    this.difficulties = '';
    this.yearlyRequirements = '';
    this.targets = '';
    this.mainSolutions = '';
    this.deepTopics = '';
    this.planAdjustments = '';
  }

  onContentChanged(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.autoSave();
    }, 2000);
  }

  private autoSave(): void {
    if (!this.currentClassId) {
      return;
    }

    if (this.isSaving) {
      return;
    }

    // Validate required fields
    if (!this.advantages || !this.advantages.trim()) {
      return; // Don't save if required field is empty
    }
    if (!this.difficulties || !this.difficulties.trim()) {
      return;
    }

    this.isSaving = true;

    const dataToSave = {
      id: this.currentKeHoachId,
      classId: this.currentClassId,
      schoolYear: this.currentSchoolYear,
      semester: 0,
      planDate: new Date(),
      advantages: this.advantages,
      difficulties: this.difficulties,
      yearlyRequirements: this.yearlyRequirements,
      targets: this.targets,
      mainSolutions: this.mainSolutions,
      deepTopics: this.deepTopics,
      planAdjustments: this.planAdjustments,
      status: 'draft'
    };

    this.keHoachService.save(dataToSave)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (!this.currentKeHoachId) {
            this.currentKeHoachId = result.id;
            notify('Đã tạo kế hoạch', 'success', 1500);
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving plan:', error);
          this.isSaving = false;
          notify('Lỗi khi lưu tự động', 'error', 2000);
        }
      });
  }

  manualSave(): void {
    if (!this.currentClassId) {
      notify('Vui lòng chọn lớp', 'warning', 2000);
      return;
    }

    if (!this.advantages || !this.advantages.trim()) {
      notify('Vui lòng nhập mục Thuận lợi', 'warning', 2000);
      return;
    }

    if (!this.difficulties || !this.difficulties.trim()) {
      notify('Vui lòng nhập mục Khó khăn', 'warning', 2000);
      return;
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.isSaving = true;

    const dataToSave = {
      id: this.currentKeHoachId,
      classId: this.currentClassId,
      schoolYear: this.currentSchoolYear,
      semester: 0,
      planDate: new Date(),
      advantages: this.advantages,
      difficulties: this.difficulties,
      yearlyRequirements: this.yearlyRequirements,
      targets: this.targets,
      mainSolutions: this.mainSolutions,
      deepTopics: this.deepTopics,
      planAdjustments: this.planAdjustments,
      status: 'draft'
    };

    this.keHoachService.save(dataToSave)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (!this.currentKeHoachId) {
            this.currentKeHoachId = result.id;
          }
          notify('Đã lưu kế hoạch thành công', 'success', 2000);
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving plan:', error);
          const errorMsg = error.error?.message || 'Có lỗi khi lưu kế hoạch';
          notify(errorMsg, 'error', 3000);
          this.isSaving = false;
        }
      });
  }
}
