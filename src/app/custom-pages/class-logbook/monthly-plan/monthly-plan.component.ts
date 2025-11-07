import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { KeHoachItem, KeHoachThang, MonthlyPlanService, NhatKyItem } from 'src/app/services/monthly-plan.service';
import { ClassService } from 'src/app/services/class.service';
import { GeneralService } from 'src/app/services/general.service';
import { AuthService } from 'src/app/services';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-monthly-plan',
  templateUrl: './monthly-plan.component.html',
  styleUrls: ['./monthly-plan.component.scss']
})
export class MonthlyPlanComponent implements OnInit, OnDestroy {
  @ViewChild('planGrid', { static: false }) planGrid: DxDataGridComponent;
  @ViewChild('journalGrid', { static: false }) journalGrid: DxDataGridComponent;
  splitSizes: number[] = [50, 50];
  monthlyPlanData: KeHoachItem[] = [];
  teacherJournalData: NhatKyItem[] = [];
  planCount = 0;
  journalCount = 0;
  monthlyTopic = '';
  monthlyFocus = '';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  currentKeHoachId: string | undefined;
  currentClassId: string = '';
  currentClassName: string = '';
  currentSchoolId: string = '';
  currentSchoolYear: number = new Date().getFullYear();
  gradeSource = [];
  classSource = [];
  filterClassSource = [];
  filterClassId: any;
  isLoading = false;
  isSaving = false;
  private saveTimeout: any;
  private destroy$ = new Subject<void>();
  
  get startDate(): string {
    return '01';
  }
  
  get endDate(): string {
    const lastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    return lastDay.toString().padStart(2, '0');
  }
  
  get monthPadded(): string {
    return this.selectedMonth.toString().padStart(2, '0');
  }
  
  monthSource = [
    { id: 9,  name: 'Tháng 9',  value: 9 },
    { id: 10, name: 'Tháng 10', value: 10 },
    { id: 11, name: 'Tháng 11', value: 11 },
    { id: 12, name: 'Tháng 12', value: 12 },
    { id: 1,  name: 'Tháng 1',  value: 1 },
    { id: 2,  name: 'Tháng 2',  value: 2 },
    { id: 3,  name: 'Tháng 3',  value: 3 },
    { id: 4,  name: 'Tháng 4',  value: 4 },
    { id: 5,  name: 'Tháng 5',  value: 5 },
    { id: 6,  name: 'Tháng 6',  value: 6 },
    { id: 7,  name: 'Tháng 7',  value: 7 },
    { id: 8,  name: 'Tháng 8',  value: 8 },
  ];

  yearSource: Array<{id: number, name: string, value: number}> = [];

  exportTexts = {
    exportTo: 'Xuất ra',
    exportAll: 'Xuất tất cả dữ liệu',
    exportSelectedRows: 'Xuất hàng đã chọn'
  };

  constructor(
    private monthlyPlanService: MonthlyPlanService,
    private classService: ClassService,
    private generalService: GeneralService,
    private authService: AuthService
  ) {
    this.setupYears();
  }
  
  get displayYear(): number {
    // Tháng 9,10,11,12 → dùng selectedYear
    // Tháng 1,2,3,4,5,6,7,8 → dùng selectedYear + 1
    return this.selectedMonth >= 9 ? this.selectedYear : this.selectedYear + 1;
  }

  get displayYearPrev(): number {
    // Dùng cho phần đầu nếu tháng hiện tại là 1-8
    return this.selectedYear;
  }

  private setupYears(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // XÁC ĐỊNH NĂM HỌC HIỆN TẠI
    let schoolYearStart: number;
    if (currentMonth >= 9) {
      schoolYearStart = currentYear;           // 9,10,11,12 → năm học 2025-2026
    } else {
      schoolYearStart = currentYear - 1;       // 1→8 → năm học 2024-2025
    }

    // Tạo danh sách 5 năm học gần nhất (mới nhất ở trên)
    this.yearSource = [];
    for (let i = 0; i < 5; i++) {
      const year = schoolYearStart - i;
      this.yearSource.push({
        id: year,
        name: `${year} - ${year + 1}`,
        value: year
      });
    }

    // TỰ ĐỘNG CHỌN NĂM HIỆN TẠI
    this.selectedYear = schoolYearStart;

    // TỰ ĐỘNG CHỌN THÁNG HIỆN TẠI (theo năm học)
    this.selectedMonth = currentMonth;
  }

  async ngOnInit() {
    this.loadSplitSizes();
    await this.initializeData();
  }

  private loadSplitSizes(): void {
    const savedSizes = localStorage.getItem('monthly-plan-split-sizes');
    if (savedSizes) {
      try {
        this.splitSizes = JSON.parse(savedSizes);
      } catch (error) {
        console.error('Error loading split sizes:', error);
        this.splitSizes = [50, 50];
      }
    }
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
        this.generalService.getListClassBySchool(user.data.schoolId),
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([gradeSource, classSource, schoolClassSource]) => {
          this.setupFilters(user, gradeSource, classSource, schoolClassSource);
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

  private setupFilters(user: any, gradeSource: any[], classSource: any[], schoolClassSource: any[]) {
    this.classSource = (user.data.role === 2 || user.data.isBGH) 
      ? schoolClassSource 
      : classSource;
    
    const filterGradeIds = classSource.map(en => en.grade);

    if (user.data.role === 2 || user.data.isBGH) {
      this.gradeSource = [...gradeSource];
    } else {
      this.gradeSource = gradeSource.filter(en => filterGradeIds.includes(en));
    }
    
    this.gradeSource.unshift('Tất cả');
    this.filterClassSource = [...this.classSource];
    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
      this.currentClassId = this.filterClassId;
      this.currentClassName = this.filterClassSource[0].name;
      this.loadData();
    } else {
      notify('Không tìm thấy lớp học nào', 'warning', 3000);
    }
  }

  loadData(): void {
    if (!this.currentClassId) {
      console.warn('ClassId not found');
      notify('Chưa chọn lớp học', 'warning', 2000);
      return;
    }

    if (this.selectedMonth < 1 || this.selectedMonth > 12) {
      notify('Tháng không hợp lệ', 'error', 2000);
      return;
    }

    this.isLoading = true;

    this.monthlyPlanService
      .getByClassMonthYear(this.currentClassId, this.selectedMonth, this.selectedYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.handleLoadSuccess(data);
        },
        error: (error) => {
          this.handleLoadError(error);
        }
      });
  }

  private handleLoadSuccess(data: KeHoachThang): void {
    const isValidId = data.id && 
                      data.id.length === 24 && 
                      data.id !== '000000000000000000000000';
    
    this.currentKeHoachId = isValidId ? data.id : undefined;
    this.monthlyTopic = data.chuDeThang || '';
    this.monthlyFocus = data.trongTam || '';
    this.monthlyPlanData = data.keHoachs || [];
    this.teacherJournalData = data.nhatKys || [];
    
    this.planCount = this.monthlyPlanData.length;
    this.journalCount = this.teacherJournalData.length;
    
    this.isLoading = false;
  }

  private handleLoadError(error: any): void {
    this.currentKeHoachId = undefined;
    this.monthlyTopic = '';
    this.monthlyFocus = '';
    this.monthlyPlanData = [];
    this.teacherJournalData = [];
    this.planCount = 0;
    this.journalCount = 0;
    
    this.isLoading = false;
    
    const errorMsg = error.error?.message || 'Có lỗi khi tải dữ liệu';
    notify(errorMsg, 'error', 3000);
  }

  saveData(): void {
    if (!this.currentClassId) {
      notify('Chưa có thông tin lớp học', 'warning', 3000);
      return;
    }

    if (!this.monthlyTopic || this.monthlyTopic.trim() === '') {
      notify('Vui lòng nhập chủ đề tháng', 'warning', 3000);
      return;
    }

    if (this.isSaving) {
      console.log('Already saving, skipping...');
      return;
    }
    
    this.isSaving = true;

    const dataToSave: KeHoachThang = {
      classId: this.currentClassId,
      className: this.currentClassName,
      month: this.selectedMonth,
      year: this.selectedYear,
      schoolYear: this.currentSchoolYear,
      chuDeThang: this.monthlyTopic.trim(),
      trongTam: this.monthlyFocus.trim(),
      keHoachs: this.monthlyPlanData,
      nhatKys: this.teacherJournalData
    };

    if (this.currentKeHoachId) {
      dataToSave.id = this.currentKeHoachId;
    }

    this.monthlyPlanService
      .save(dataToSave)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.currentKeHoachId = result.id;
          notify('✅ Lưu thành công', 'success', 2000);
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving:', error);
          const errorMsg = error.error?.message || 'Có lỗi khi lưu dữ liệu';
          notify(`❌ ${errorMsg}`, 'error', 3000);
          this.isSaving = false;
        }
      });
  }

  onSplitDragEnd(event: any): void {
    if (event && event.sizes) {
      this.splitSizes = event.sizes;
      localStorage.setItem('monthly-plan-split-sizes', JSON.stringify(event.sizes));
    }
    setTimeout(() => {
      this.planGrid?.instance?.updateDimensions();
      this.journalGrid?.instance?.updateDimensions();
    }, 100);
  }

  gradeChange($event: any) {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = [...this.classSource];
    }
    
    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
      this.classChange({ itemData: this.filterClassSource[0] });
    } else {
      notify('Không có lớp nào trong khối này', 'info', 2000);
    }
  }

  classChange($event) {
    this.filterClassId = $event.itemData.id;
    this.currentClassId = $event.itemData.id;
    this.currentClassName = $event.itemData.name;
    this.loadData();
  }

  monthChange(event: any): void {
    this.selectedMonth = event.itemData.value;
    this.loadData();
  }

  yearChange(event: any): void {
    this.selectedYear = event.itemData.value;
    this.loadData();
  }

  onPlanExporting(event: any): void {
    const fileName = `KeHoachThang_${this.currentClassName}_T${this.selectedMonth}_${this.selectedYear}`;
    event.fileName = fileName;
  }

  onJournalExporting(event: any): void {
    const fileName = `NhatKyChuNhiem_${this.currentClassName}_T${this.selectedMonth}_${this.selectedYear}`;
    event.fileName = fileName;
  }

  onPlanRowUpdating(event: any): void {
    setTimeout(() => this.saveData(), 500);
  }

  onPlanRowInserting(event: any): void {
    event.data.stt = this.monthlyPlanData.length + 1;
    this.planCount++;
    setTimeout(() => this.saveData(), 500);
  }

  onPlanRowRemoving(event: any): void {
    this.planCount--;
    setTimeout(() => this.saveData(), 500);
  }

  onJournalRowUpdating(event: any): void {
    setTimeout(() => this.saveData(), 500);
  }

  onJournalRowInserting(event: any): void {
    event.data.stt = this.teacherJournalData.length + 1;
    this.journalCount++;
    setTimeout(() => this.saveData(), 500);
  }

  onJournalRowRemoving(event: any): void {
    this.journalCount--;
    setTimeout(() => this.saveData(), 500);
  }

  onTopicChange(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveData(), 1000);
  }

  onFocusChange(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveData(), 1000);
  }
}