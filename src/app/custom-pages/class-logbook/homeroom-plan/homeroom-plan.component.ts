import { Component, OnInit, OnDestroy } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { ClassService } from 'src/app/services/class.service';
import { GeneralService } from 'src/app/services/general.service';
import { AuthService } from 'src/app/services';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KeHoachChuNhiem, KeHoachChuNhiemService } from 'src/app/services/homeroom-plan.service';

@Component({
  selector: 'app-homeroom-plan',
  templateUrl: './homeroom-plan.component.html',
  styleUrls: ['./homeroom-plan.component.scss']
})
export class HomeroomPlanComponent implements OnInit, OnDestroy {
  datas: KeHoachChuNhiem[] = [];
  filteredDatas: KeHoachChuNhiem[] = [];
  plansCount = 0;
  currentStep = 1;
  popupVisible = false;
  isEditMode = false;
  currentPlan: KeHoachChuNhiem = this.getEmptyPlan();
  
  // Track trạng thái đóng/mở của từng card - MẶC ĐỊNH TẤT CẢ ĐÓNG
  collapsedCards: { [key: string]: boolean } = {};
  
  tempFormData: any = {};
  
  schoolYearSource: number[] = [];
  selectedSchoolYear = 0;
  
  semesterSource = [
    { value: 0, name: 'Tất cả' },
    { value: 1, name: 'Học kỳ I' },
    { value: 2, name: 'Học kỳ II' }
  ];
  selectedSemester = 0;
  
  gradeSource = [];
  classSource = [];
  filterClassSource = [];
  filterClassId: any = null;
  
  filterStatusSource: any[] = [];
  selectedStatus = '';
  
  statusSource = [
    { value: 'draft', name: 'Bản nháp' },
    { value: 'submitted', name: 'Đã nộp' },
    { value: 'approved', name: 'Đã duyệt' },
    { value: 'rejected', name: 'Cần sửa' }
  ];

  currentSchoolId: string = '';
  currentSchoolYear: number = new Date().getFullYear();
  currentUser: any;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private keHoachService: KeHoachChuNhiemService,
    private classService: ClassService,
    private generalService: GeneralService,
    private authService: AuthService
  ) { }

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
      this.currentUser = user.data;
      this.currentSchoolId = user.data.schoolId;
      this.currentSchoolYear = user.data.schoolYear || new Date().getFullYear();
      this.selectedSchoolYear = this.currentSchoolYear;

      this.setupSchoolYears();
      
      forkJoin([
        this.generalService.getListGradeOfSchool(user.data.schoolId),
        this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
        this.generalService.getListClassBySchool(user.data.schoolId),
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([gradeSource, classSource, schoolClassSource]) => {
          this.setupFilters(gradeSource, classSource, schoolClassSource);
          this.loadPlanData();
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

  private setupSchoolYears() {
    const currentYear = new Date().getFullYear();
    this.schoolYearSource = [
      currentYear + 1,
      currentYear,
      currentYear - 1,
      currentYear - 2
    ];
  }

  private setupFilters(gradeSource: any[], classSource: any[], schoolClassSource: any[]) {
    this.classSource = (this.currentUser.role === 2 || this.currentUser.isBGH) 
      ? schoolClassSource 
      : classSource;
    
    const filterGradeIds = classSource.map(en => en.grade);

    if (this.currentUser.role === 2 || this.currentUser.isBGH) {
      this.gradeSource = [...gradeSource];
    } else {
      this.gradeSource = gradeSource.filter(en => filterGradeIds.includes(en));
    }
    
    this.gradeSource.unshift('Tất cả');
    this.filterClassSource = [...this.classSource];
    
    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
    }

    this.filterStatusSource = [
      { value: '', name: 'Tất cả' },
      ...this.statusSource
    ];
  }

  loadPlanData(): void {
    if (!this.currentSchoolId) {
      notify('Không tìm thấy thông tin trường', 'warning', 2000);
      return;
    }

    const schoolYear = this.selectedSchoolYear || this.currentSchoolYear;
    this.isLoading = true;

    this.keHoachService.getListBySchool(
      this.currentSchoolId,
      schoolYear,
      1,
      1000,
      this.filterClassId ? this.filterClassSource.find(c => c.id === this.filterClassId)?.name : undefined,
      this.selectedSemester > 0 ? this.selectedSemester : undefined,
      undefined,
      this.selectedStatus || undefined
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.datas = result.items.map(item => this.mapFromApi(item));
        // MẶC ĐỊNH TẤT CẢ CARD ĐÓNG
        this.datas.forEach(plan => {
          if (plan.id) {
            this.collapsedCards[plan.id] = true;
          }
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        notify('Có lỗi khi tải danh sách kế hoạch', 'error', 2000);
        this.isLoading = false;
      }
    });
  }

  private mapFromApi(apiData: any): KeHoachChuNhiem {
    return {
      id: apiData.id,
      schoolId: apiData.schoolId,
      classId: apiData.classId,
      className: apiData.className,
      grade: apiData.grade,
      homeRoomTeacherId: apiData.homeRoomTeacherId,
      homeRoomTeacherName: apiData.homeRoomTeacherName,
      schoolYear: apiData.schoolYear,
      semester: apiData.semester,
      planDate: apiData.planDate ? new Date(apiData.planDate) : new Date(),
      dateCreated: apiData.dateCreated ? new Date(apiData.dateCreated) : undefined,
      dateModified: apiData.dateModified ? new Date(apiData.dateModified) : undefined,
      advantages: apiData.advantages || '',
      difficulties: apiData.difficulties || '',
      traditionEducation: apiData.traditionEducation || { objectives: '', content: '', solutions: '', expectedResults: '' },
      academicEducation: apiData.academicEducation || { objectives: '', content: '', solutions: '', expectedResults: '' },
      extracurricularEducation: apiData.extracurricularEducation || { objectives: '', content: '', solutions: '', expectedResults: '' },
      status: apiData.status || 'draft',
      notes: apiData.notes || '',
      isActive: apiData.isActive !== false
    };
  }

  private mapToApi(planData: KeHoachChuNhiem): any {
    return {
      id: planData.id,
      classId: planData.classId,
      schoolYear: planData.schoolYear,
      semester: planData.semester,
      planDate: planData.planDate,
      advantages: planData.advantages,
      difficulties: planData.difficulties,
      traditionEducation: planData.traditionEducation,
      academicEducation: planData.academicEducation,
      extracurricularEducation: planData.extracurricularEducation,
      status: planData.status,
      notes: planData.notes
    };
  }

  onFilterChange(): void {
    this.loadPlanData();
  }

  applyFilters(): void {
    this.filteredDatas = [...this.datas];
    this.plansCount = this.filteredDatas.length;
  }

  clearFilters(): void {
    this.selectedSchoolYear = this.currentSchoolYear;
    this.selectedSemester = 0;
    this.filterClassId = null;
    this.selectedStatus = '';
    this.loadPlanData();
  }

  gradeChange($event: any) {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = [...this.classSource];
    }
    
    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
    } else {
      this.filterClassId = null;
      notify('Không có lớp nào trong khối này', 'info', 2000);
    }
    this.loadPlanData();
  }

  addNewPlan(): void {
    this.isEditMode = false;
    this.currentPlan = this.getEmptyPlan();
    this.flattenPlanToTemp();
    this.currentStep = 1;
    this.popupVisible = true;
  }

  editPlan(plan: KeHoachChuNhiem): void {
    this.isEditMode = true;
    this.currentPlan = JSON.parse(JSON.stringify(plan));
    this.flattenPlanToTemp();
    this.currentStep = 1;
    this.popupVisible = true;
  }

  flattenPlanToTemp(): void {
    this.tempFormData = {
      schoolYear: this.currentPlan.schoolYear,
      semester: this.currentPlan.semester,
      classId: this.currentPlan.classId,
      advantages: this.currentPlan.advantages || '',
      difficulties: this.currentPlan.difficulties || '',
      trad_obj: this.currentPlan.traditionEducation?.objectives || '',
      trad_con: this.currentPlan.traditionEducation?.content || '',
      trad_sol: this.currentPlan.traditionEducation?.solutions || '',
      trad_res: this.currentPlan.traditionEducation?.expectedResults || '',
      acad_obj: this.currentPlan.academicEducation?.objectives || '',
      acad_con: this.currentPlan.academicEducation?.content || '',
      acad_sol: this.currentPlan.academicEducation?.solutions || '',
      acad_res: this.currentPlan.academicEducation?.expectedResults || '',
      extra_obj: this.currentPlan.extracurricularEducation?.objectives || '',
      extra_con: this.currentPlan.extracurricularEducation?.content || '',
      extra_sol: this.currentPlan.extracurricularEducation?.solutions || '',
      extra_res: this.currentPlan.extracurricularEducation?.expectedResults || '',
      status: this.currentPlan.status || 'draft',
      notes: this.currentPlan.notes || ''
    };
  }

  unflattenTempToPlan(): void {
    this.currentPlan.schoolYear = this.tempFormData.schoolYear;
    this.currentPlan.semester = this.tempFormData.semester;
    this.currentPlan.classId = this.tempFormData.classId;
    this.currentPlan.advantages = this.tempFormData.advantages;
    this.currentPlan.difficulties = this.tempFormData.difficulties;
    
    this.currentPlan.traditionEducation = {
      objectives: this.tempFormData.trad_obj,
      content: this.tempFormData.trad_con,
      solutions: this.tempFormData.trad_sol,
      expectedResults: this.tempFormData.trad_res
    };
    
    this.currentPlan.academicEducation = {
      objectives: this.tempFormData.acad_obj,
      content: this.tempFormData.acad_con,
      solutions: this.tempFormData.acad_sol,
      expectedResults: this.tempFormData.acad_res
    };
    
    this.currentPlan.extracurricularEducation = {
      objectives: this.tempFormData.extra_obj,
      content: this.tempFormData.extra_con,
      solutions: this.tempFormData.extra_sol,
      expectedResults: this.tempFormData.extra_res
    };
    
    this.currentPlan.status = this.tempFormData.status;
    this.currentPlan.notes = this.tempFormData.notes;
  }

  deletePlan(plan: KeHoachChuNhiem): void {
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa kế hoạch ${plan.className} - Học kỳ ${plan.semester}?`);
    if (confirmed) {
      this.keHoachService.delete(plan.id!, { id: plan.id! })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notify('Đã xóa kế hoạch thành công', 'success', 2000);
            this.loadPlanData();
          },
          error: (error) => {
            console.error('Error deleting plan:', error);
            notify('Có lỗi khi xóa kế hoạch', 'error', 2000);
          }
        });
    }
  }

  savePlan(): void {
    this.unflattenTempToPlan();
    
    if (!this.currentPlan.classId) {
      notify('Vui lòng chọn lớp', 'warning', 2000);
      return;
    }

    if (this.currentPlan.semester === 1) {
      if (!this.currentPlan.advantages || !this.currentPlan.advantages.trim()) {
        notify('Học kỳ 1 phải có mục Thuận lợi', 'warning', 2000);
        return;
      }
      if (!this.currentPlan.difficulties || !this.currentPlan.difficulties.trim()) {
        notify('Học kỳ 1 phải có mục Khó khăn', 'warning', 2000);
        return;
      }
    }

    const dataToSave = this.mapToApi(this.currentPlan);

    this.keHoachService.save(dataToSave)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          notify(this.isEditMode ? 'Đã cập nhật kế hoạch thành công' : 'Đã thêm kế hoạch thành công', 'success', 2000);
          this.popupVisible = false;
          this.loadPlanData();
        },
        error: (error) => {
          console.error('Error saving plan:', error);
          const errorMsg = error.error?.message || 'Có lỗi khi lưu kế hoạch';
          notify(errorMsg, 'error', 3000);
        }
      });
  }

  closePopup(): void {
    this.popupVisible = false;
    this.tempFormData = {};
  }

  onSaveClick(): void {
    this.savePlan();
  }

  onCancelClick(): void {
    this.closePopup();
  }

  exportData(): void {
    notify('Chức năng xuất Excel đang được phát triển', 'info', 2000);
  }

  getEmptyPlan(): KeHoachChuNhiem {
    return {
      classId: '',
      schoolYear: this.currentSchoolYear,
      semester: 1,
      planDate: new Date(),
      advantages: '',
      difficulties: '',
      traditionEducation: {
        objectives: '',
        content: '',
        solutions: '',
        expectedResults: ''
      },
      academicEducation: {
        objectives: '',
        content: '',
        solutions: '',
        expectedResults: ''
      },
      extracurricularEducation: {
        objectives: '',
        content: '',
        solutions: '',
        expectedResults: ''
      },
      status: 'draft',
      notes: ''
    };
  }

  getSemesterText(semester: number): string {
    const sem = this.semesterSource.find(s => s.value === semester);
    return sem ? sem.name : `Học kỳ ${semester}`;
  }

  getSemesterClass(semester: number): string {
    return semester === 1 ? 'semester-1' : 'semester-2';
  }

  getStatusText(status: string): string {
    const stat = this.statusSource.find(s => s.value === status);
    return stat ? stat.name : status;
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'draft': 'status-draft',
      'submitted': 'status-submitted',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return classes[status] || '';
  }

  nextStep(): void {
    if (this.currentStep < 6) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getStepName(step: number): string {
    const names = {
      1: 'Cơ bản',
      2: 'Tình hình', 
      3: 'Truyền thống',
      4: 'Học tập',
      5: 'Ngoại khóa',
      6: 'Hoàn tất'
    };
    return names[step] || '';
  }
  toggleCard(planId: string): void {
    this.collapsedCards[planId] = !this.collapsedCards[planId];
  }
  isCardCollapsed(planId: string): boolean {
    return this.collapsedCards[planId] !== false;
  }
}