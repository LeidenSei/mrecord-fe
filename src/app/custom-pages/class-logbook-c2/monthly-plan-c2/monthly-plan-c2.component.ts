import { Component, OnInit, OnDestroy } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { KeHoachThang, MonthlyPlanService, ThongKeThangItem } from 'src/app/services/monthly-plan.service';
import { ClassService } from 'src/app/services/class.service';
import { GeneralService } from 'src/app/services/general.service';
import { AuthService } from 'src/app/services';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-monthly-plan-c2',
  templateUrl: './monthly-plan-c2.component.html',
  styleUrls: ['./monthly-plan-c2.component.scss']
})
export class MonthlyPlanC2Component implements OnInit, OnDestroy {
  keHoachHoatDong = '';
  danhGiaHocTap = '';
  danhGiaRenLuyen = '';
  thongKeThang: ThongKeThangItem[] = [];
  
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

  // Danh sách nội dung mặc định cho bảng thống kê
  defaultThongKeItems = [
    'Số học sinh nghỉ học',
    'Số đi muộn',
    'Số bỏ tiết',
    'Số không chuẩn bị bài',
    'Số bị dưới 5.0',
    'Mắc thái độ sai',
    'Số điểm tốt',
    'Số việc tốt',
    'HS được khen',
    'HS bị phê bình',
    'Số tiết trống',
    'Số tiết tự quản tốt',
    'Xếp loại cả lớp'
  ];

  constructor(
    private monthlyPlanService: MonthlyPlanService,
    private classService: ClassService,
    private generalService: GeneralService,
    private authService: AuthService
  ) {
    this.setupYears();
    this.initializeThongKeThang();
  }
  
  get displayYear(): number {
    return this.selectedMonth >= 9 ? this.selectedYear : this.selectedYear + 1;
  }

  get displayYearPrev(): number {
    return this.selectedYear;
  }

  private setupYears(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    let schoolYearStart: number;
    if (currentMonth >= 9) {
      schoolYearStart = currentYear;
    } else {
      schoolYearStart = currentYear - 1;
    }

    this.yearSource = [];
    for (let i = 0; i < 5; i++) {
      const year = schoolYearStart - i;
      this.yearSource.push({
        id: year,
        name: `${year} - ${year + 1}`,
        value: year
      });
    }

    this.selectedYear = schoolYearStart;
    this.selectedMonth = currentMonth;
  }

  private initializeThongKeThang(): void {
    this.thongKeThang = this.defaultThongKeItems.map((noiDung, index) => ({
      sTT: index + 1,
      noiDung: noiDung,
      tuan1: 0,
      tuan2: 0,
      tuan3: 0,
      tuan4: 0
    }));
  }

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
      .getByClassMonthYearC2(this.currentClassId, this.selectedMonth, this.selectedYear)
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
    this.keHoachHoatDong = data.keHoachHoatDong || '';
    this.danhGiaHocTap = data.danhGiaHocTap || '';
    this.danhGiaRenLuyen = data.danhGiaRenLuyen || '';
    
    // Load thống kê tháng
    if (data.thongKeThang && data.thongKeThang.length > 0) {
      this.thongKeThang = data.thongKeThang;
    } else {
      this.initializeThongKeThang();
    }
    
    this.isLoading = false;
  }

  private handleLoadError(error: any): void {
    this.currentKeHoachId = undefined;
    this.keHoachHoatDong = '';
    this.danhGiaHocTap = '';
    this.danhGiaRenLuyen = '';
    this.initializeThongKeThang();
    
    this.isLoading = false;
    
    const errorMsg = error.error?.message || 'Có lỗi khi tải dữ liệu';
    notify(errorMsg, 'error', 3000);
  }

  saveData(): void {
    if (!this.currentClassId) {
      notify('Chưa có thông tin lớp học', 'warning', 3000);
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
      keHoachHoatDong: this.keHoachHoatDong,
      danhGiaHocTap: this.danhGiaHocTap,
      danhGiaRenLuyen: this.danhGiaRenLuyen,
      thongKeThang: this.thongKeThang
    };

    if (this.currentKeHoachId) {
      dataToSave.id = this.currentKeHoachId;
    }

    this.monthlyPlanService
      .saveC2(dataToSave)
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

  gradeChange($event: any) {
    const gradeValue = $event.itemData !== undefined ? $event.itemData : $event.value;

    if (gradeValue && !Number.isNaN(gradeValue)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +gradeValue);
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
    // Kiểm tra event có itemData không
    if (!$event.itemData) {
      // Nếu không có itemData, tìm class từ value
      if (!$event.value) return;
      const selectedClass = this.filterClassSource.find(c => c.id === $event.value);
      if (!selectedClass) return;

      this.filterClassId = selectedClass.id;
      this.currentClassId = selectedClass.id;
      this.currentClassName = selectedClass.name;
    } else {
      this.filterClassId = $event.itemData.id;
      this.currentClassId = $event.itemData.id;
      this.currentClassName = $event.itemData.name;
    }

    this.resetFormData();
    this.loadData();
  }

  monthChange(event: any): void {
    if (!event.itemData && !event.value) return;
    this.selectedMonth = event.itemData ? event.itemData.value : event.value;
    this.resetFormData();
    this.loadData();
  }

  yearChange(event: any): void {
    if (!event.itemData && !event.value) return;
    this.selectedYear = event.itemData ? event.itemData.value : event.value;
    this.resetFormData();
    this.loadData();
  }

  private resetFormData(): void {
    // Clear timeout để tránh save dữ liệu cũ
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Hiển thị loading ngay lập tức để user biết đang đổi dữ liệu
    this.isLoading = true;

    // Reset về trạng thái ban đầu
    this.currentKeHoachId = undefined;
    this.keHoachHoatDong = '';
    this.danhGiaHocTap = '';
    this.danhGiaRenLuyen = '';
    this.initializeThongKeThang();
  }
}