import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';
import { AuthService } from 'src/app/services';
import { GeneralService } from 'src/app/services/general.service';
import { ClassAnnualSummaryService } from 'src/app/services/class-annual-summary.service';
import { TeacherAnnualReportService, TeacherAnnualReportDto, SelfAssessmentReportDto, InnovationReportDto, PerformanceIndicatorDto, ProfileInfoDto, AchievementInfoDto, AdditionalInfoDto, TeacherReportType } from 'src/app/services/teacher-annual-report.service';

interface QualityLevel {
  soLuong: number;
  tyLe: number;
}

interface SemesterQuality {
  tot: QualityLevel;
  kha: QualityLevel;
  dat: QualityLevel;
  chuaDat: QualityLevel;
}

interface StudentStatistics {
  soHocSinhDauNam: number;
  soHocSinhCuoiKy1: number;
  soHocSinhCuoiNam: number;
  soHocSinhBoHocDoHocKem: number;
  soHocSinhBoHocDoBenhTat: number;
  soHocSinhBoHocDoHoanCanhKhoKhan: number;
  soHocSinhBoHocDoLyDoKhac: number;
}

interface AchievementStatistics {
  hocSinhChamTienDauNam: number;
  hocSinhChamTienCuoiKy1: number;
  hocSinhChamTienCuoiKy2: number;
  hocSinhThiHSGCapQuanCum: number;
  hocSinhThiHSGCapTP: number;
  hocSinhDatHSGCapQuanCum: number;
  xepLoaiLopCuoiKy1: number;
  xepLoaiLopCuoiKy2: number;
  xepLoaiChiDoiCuoiKy1: number;
  xepLoaiChiDoiCuoiKy2: number;
}

interface ClassAnnualSummary {
  id?: string;
  classId: string;
  className: string;
  schoolId: string;
  schoolYear: number;
  gradeLevel: string;
  homeRoomTeacherId?: string;
  homeRoomTeacherName?: string;
  trainingQualityHK1: SemesterQuality;
  trainingQualityHK2: SemesterQuality;
  learningQualityHK1: SemesterQuality;
  learningQualityHK2: SemesterQuality;
  statistics: StudentStatistics;
  achievements: AchievementStatistics;
  additionalComments?: string;
  gvcnSolutionsAndClassChanges?: string;
  otherSpecialAchievements?: string;
}

@Component({
  selector: 'app-year-end-summary-c2',
  templateUrl: './year-end-summary-c2.component.html',
  styleUrls: ['./year-end-summary-c2.component.scss']
})
export class YearEndSummaryC2Component implements OnInit, OnDestroy {

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

  // Tab selection
  selectedTabIndex: number = 0;
  tabs = [
    { id: 0, text: 'Chất lượng giáo dục 2 mặt' },
    { id: 1, text: 'Biện pháp giáo dục của GVCN' },
    { id: 2, text: 'Hồ sơ giáo viên dạy giỏi' },
  ];

  // Summary data
  summaryData: ClassAnnualSummary = this.getEmptySummary();

  qualityData: any[] = [];
  statisticsData: any[] = [];
  achievementsData: any[] = [];

  isLoading = false;
  isSaving = false;

  // Teacher Annual Report data
  teacherReport: TeacherAnnualReportDto | null = null;
  currentTeacherId: string = '';

  // Report Type Selection
  selectedReportType: number = TeacherReportType.SelfAssessment;
  reportTypeOptions = [
    { id: TeacherReportType.SelfAssessment, text: 'Mẫu 1: Tự báo cáo thành tích' },
    { id: TeacherReportType.Innovation, text: 'Mẫu 2: Sáng kiến kinh nghiệm' }
  ];

  // Template 1 data sources
  performanceIndicatorsData: any[] = [];

  private destroy$ = new Subject<void>();
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };
  constructor(
    private authService: AuthService,
    private generalService: GeneralService,
    private classAnnualSummaryService: ClassAnnualSummaryService,
    private teacherAnnualReportService: TeacherAnnualReportService
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
      this.currentTeacherId = user.data.personId;

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
            this.loadTeacherReport();
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
    this.loadTeacherReport();
  }

  onTabSelectionChanged(e: any): void {
    this.selectedTabIndex = e.addedItems[0].id;
  }

  private loadData(): void {
    if (!this.filterClassId) {
      this.summaryData = this.getEmptySummary();
      this.buildDataSources();
      return;
    }

    this.isLoading = true;

    this.classAnnualSummaryService.getByClass(this.filterClassId, this.currentSchoolYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.id) {
            this.summaryData = this.mapResponseToSummary(response);
          } else {
            this.summaryData = this.getEmptySummary();
            this.summaryData.classId = this.filterClassId;
            this.summaryData.schoolId = this.currentSchoolId;
            this.summaryData.schoolYear = this.currentSchoolYear;

            const selectedClass = this.filterClassSource.find(c => c.id === this.filterClassId);
            if (selectedClass) {
              this.summaryData.className = selectedClass.name;
              this.summaryData.gradeLevel = selectedClass.grade?.toString() || '';
            }
          }
          this.buildDataSources();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          // If 404, it's just no data yet
          if (error.status === 404) {
            this.summaryData = this.getEmptySummary();
            this.summaryData.classId = this.filterClassId;
            this.summaryData.schoolId = this.currentSchoolId;
            this.summaryData.schoolYear = this.currentSchoolYear;

            const selectedClass = this.filterClassSource.find(c => c.id === this.filterClassId);
            if (selectedClass) {
              this.summaryData.className = selectedClass.name;
              this.summaryData.gradeLevel = selectedClass.grade?.toString() || '';
            }
            this.buildDataSources();
          } else {
            notify('Có lỗi khi tải dữ liệu', 'error', 3000);
          }
          this.isLoading = false;
        }
      });
  }

  private mapResponseToSummary(response: any): ClassAnnualSummary {
    return {
      id: response.id,
      classId: response.classId,
      className: response.className,
      schoolId: response.schoolId,
      schoolYear: response.schoolYear,
      gradeLevel: response.gradeLevel,
      homeRoomTeacherId: response.homeRoomTeacherId,
      homeRoomTeacherName: response.homeRoomTeacherName,
      trainingQualityHK1: this.mapQuality(response.trainingQualityHK1),
      trainingQualityHK2: this.mapQuality(response.trainingQualityHK2),
      learningQualityHK1: this.mapQuality(response.learningQualityHK1),
      learningQualityHK2: this.mapQuality(response.learningQualityHK2),
      statistics: response.statistics || this.getEmptyStatistics(),
      achievements: response.achievements || this.getEmptyAchievements(),
      additionalComments: response.additionalComments,
      gvcnSolutionsAndClassChanges: response.gvcnSolutionsAndClassChanges,
      otherSpecialAchievements: response.otherSpecialAchievements
    };
  }

  private mapQuality(quality: any): SemesterQuality {
    if (!quality) return this.getEmptyQuality();
    return {
      tot: quality.tot || { soLuong: 0, tyLe: 0 },
      kha: quality.kha || { soLuong: 0, tyLe: 0 },
      dat: quality.dat || { soLuong: 0, tyLe: 0 },
      chuaDat: quality.chuaDat || { soLuong: 0, tyLe: 0 }
    };
  }

  private buildDataSources(): void {
    // === CHẤT LƯỢNG RÈN LUYỆN + HỌC TẬP (GỘP 1 GRID) ===
    this.qualityData = [
      {
        xepLoai: 'Học kỳ I',
        semester: 1,

        // RÈN LUYỆN
        trainTotSoLuong: this.summaryData.trainingQualityHK1.tot.soLuong,
        trainTotTyLe: this.summaryData.trainingQualityHK1.tot.tyLe,
        trainKhaSoLuong: this.summaryData.trainingQualityHK1.kha.soLuong,
        trainKhaTyLe: this.summaryData.trainingQualityHK1.kha.tyLe,
        trainDatSoLuong: this.summaryData.trainingQualityHK1.dat.soLuong,
        trainDatTyLe: this.summaryData.trainingQualityHK1.dat.tyLe,
        trainChuaDatSoLuong: this.summaryData.trainingQualityHK1.chuaDat.soLuong,
        trainChuaDatTyLe: this.summaryData.trainingQualityHK1.chuaDat.tyLe,

        // HỌC TẬP
        learnTotSoLuong: this.summaryData.learningQualityHK1.tot.soLuong,
        learnTotTyLe: this.summaryData.learningQualityHK1.tot.tyLe,
        learnKhaSoLuong: this.summaryData.learningQualityHK1.kha.soLuong,
        learnKhaTyLe: this.summaryData.learningQualityHK1.kha.tyLe,
        learnDatSoLuong: this.summaryData.learningQualityHK1.dat.soLuong,
        learnDatTyLe: this.summaryData.learningQualityHK1.dat.tyLe,
        learnChuaDatSoLuong: this.summaryData.learningQualityHK1.chuaDat.soLuong,
        learnChuaDatTyLe: this.summaryData.learningQualityHK1.chuaDat.tyLe
      },
      {
        xepLoai: 'Học kỳ II',
        semester: 2,

        // RÈN LUYỆN
        trainTotSoLuong: this.summaryData.trainingQualityHK2.tot.soLuong,
        trainTotTyLe: this.summaryData.trainingQualityHK2.tot.tyLe,
        trainKhaSoLuong: this.summaryData.trainingQualityHK2.kha.soLuong,
        trainKhaTyLe: this.summaryData.trainingQualityHK2.kha.tyLe,
        trainDatSoLuong: this.summaryData.trainingQualityHK2.dat.soLuong,
        trainDatTyLe: this.summaryData.trainingQualityHK2.dat.tyLe,
        trainChuaDatSoLuong: this.summaryData.trainingQualityHK2.chuaDat.soLuong,
        trainChuaDatTyLe: this.summaryData.trainingQualityHK2.chuaDat.tyLe,

        // HỌC TẬP
        learnTotSoLuong: this.summaryData.learningQualityHK2.tot.soLuong,
        learnTotTyLe: this.summaryData.learningQualityHK2.tot.tyLe,
        learnKhaSoLuong: this.summaryData.learningQualityHK2.kha.soLuong,
        learnKhaTyLe: this.summaryData.learningQualityHK2.kha.tyLe,
        learnDatSoLuong: this.summaryData.learningQualityHK2.dat.soLuong,
        learnDatTyLe: this.summaryData.learningQualityHK2.dat.tyLe,
        learnChuaDatSoLuong: this.summaryData.learningQualityHK2.chuaDat.soLuong,
        learnChuaDatTyLe: this.summaryData.learningQualityHK2.chuaDat.tyLe
      }
    ];

    // === phần statisticsData & achievementsData giữ nguyên như bạn đang làm ===
    this.statisticsData = [
      { stt: 1, noiDung: 'Số học sinh đầu năm', soLuong: this.summaryData.statistics.soHocSinhDauNam, field: 'soHocSinhDauNam' },
      { stt: 2, noiDung: 'Số học sinh cuối kỳ 1', soLuong: this.summaryData.statistics.soHocSinhCuoiKy1, field: 'soHocSinhCuoiKy1' },
      { stt: 3, noiDung: 'Số học sinh cuối năm học', soLuong: this.summaryData.statistics.soHocSinhCuoiNam, field: 'soHocSinhCuoiNam' },
      { stt: 4, noiDung: 'Số học sinh bỏ học do học kém', soLuong: this.summaryData.statistics.soHocSinhBoHocDoHocKem, field: 'soHocSinhBoHocDoHocKem' },
      { stt: 5, noiDung: 'Số học sinh bỏ học do bệnh tật', soLuong: this.summaryData.statistics.soHocSinhBoHocDoBenhTat, field: 'soHocSinhBoHocDoBenhTat' },
      { stt: 6, noiDung: 'Số học sinh bỏ học do hoàn cảnh khó khăn', soLuong: this.summaryData.statistics.soHocSinhBoHocDoHoanCanhKhoKhan, field: 'soHocSinhBoHocDoHoanCanhKhoKhan' },
      { stt: 7, noiDung: 'Số học sinh bỏ học các lý do khác', soLuong: this.summaryData.statistics.soHocSinhBoHocDoLyDoKhac, field: 'soHocSinhBoHocDoLyDoKhac' }
    ];

    this.achievementsData = [
      { stt: 1, noiDung: 'Số học sinh chăm tiến đầu năm', soLuong: this.summaryData.achievements.hocSinhChamTienDauNam, field: 'hocSinhChamTienDauNam' },
      { stt: 2, noiDung: 'Số học sinh chăm tiến cuối kỳ I', soLuong: this.summaryData.achievements.hocSinhChamTienCuoiKy1, field: 'hocSinhChamTienCuoiKy1' },
      { stt: 3, noiDung: 'Số học sinh chăm tiến cuối kỳ II', soLuong: this.summaryData.achievements.hocSinhChamTienCuoiKy2, field: 'hocSinhChamTienCuoiKy2' },
      { stt: 4, noiDung: 'Số học sinh thi học sinh giỏi của quận/cụm', soLuong: this.summaryData.achievements.hocSinhThiHSGCapQuanCum, field: 'hocSinhThiHSGCapQuanCum' },
      { stt: 5, noiDung: 'Số học sinh thi học sinh giỏi của TP', soLuong: this.summaryData.achievements.hocSinhThiHSGCapTP, field: 'hocSinhThiHSGCapTP' },
      { stt: 6, noiDung: 'Số học sinh đạt học sinh giỏi của quận/cụm', soLuong: this.summaryData.achievements.hocSinhDatHSGCapQuanCum, field: 'hocSinhDatHSGCapQuanCum' },
      { stt: 7, noiDung: 'Xếp loại lớp cuối kỳ I', soLuong: this.summaryData.achievements.xepLoaiLopCuoiKy1, field: 'xepLoaiLopCuoiKy1' },
      { stt: 8, noiDung: 'Xếp loại lớp cuối kỳ II', soLuong: this.summaryData.achievements.xepLoaiLopCuoiKy2, field: 'xepLoaiLopCuoiKy2' },
      { stt: 9, noiDung: 'Xếp loại chi đội cuối kỳ I', soLuong: this.summaryData.achievements.xepLoaiChiDoiCuoiKy1, field: 'xepLoaiChiDoiCuoiKy1' },
      { stt: 10, noiDung: 'Xếp loại chi đội cuối kỳ II', soLuong: this.summaryData.achievements.xepLoaiChiDoiCuoiKy2, field: 'xepLoaiChiDoiCuoiKy2' }
    ];
  }


  onCellPrepared(e: any): void {
    if (e.rowType === 'data' && e.column.dataField) {
      // Add custom styling if needed
    }
  }

  onSave(): void {
    if (!this.summaryData) {
      notify('Không có dữ liệu để lưu', 'warning', 2000);
      return;
    }

    // Update summary data from grid data sources
    this.updateSummaryFromGrids();

    this.isSaving = true;

    const saveObservable = this.summaryData.id
      ? this.classAnnualSummaryService.update(this.summaryData)
      : this.classAnnualSummaryService.create(this.summaryData);

    saveObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          notify('Lưu dữ liệu thành công', 'success', 2000);
          if (response.data && !this.summaryData.id) {
            this.summaryData.id = response.data;
          }
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

  private updateSummaryFromGrids(): void {
    // === LẤY DỮ LIỆU RÈN LUYỆN + HỌC TẬP TỪ GRID CHUNG ===
    if (this.qualityData.length >= 2) {
      const hk1 = this.qualityData.find(r => r.semester === 1);
      const hk2 = this.qualityData.find(r => r.semester === 2);

      if (hk1) {
        this.summaryData.trainingQualityHK1 = {
          tot: { soLuong: hk1.trainTotSoLuong || 0, tyLe: hk1.trainTotTyLe || 0 },
          kha: { soLuong: hk1.trainKhaSoLuong || 0, tyLe: hk1.trainKhaTyLe || 0 },
          dat: { soLuong: hk1.trainDatSoLuong || 0, tyLe: hk1.trainDatTyLe || 0 },
          chuaDat: { soLuong: hk1.trainChuaDatSoLuong || 0, tyLe: hk1.trainChuaDatTyLe || 0 }
        };

        this.summaryData.learningQualityHK1 = {
          tot: { soLuong: hk1.learnTotSoLuong || 0, tyLe: hk1.learnTotTyLe || 0 },
          kha: { soLuong: hk1.learnKhaSoLuong || 0, tyLe: hk1.learnKhaTyLe || 0 },
          dat: { soLuong: hk1.learnDatSoLuong || 0, tyLe: hk1.learnDatTyLe || 0 },
          chuaDat: { soLuong: hk1.learnChuaDatSoLuong || 0, tyLe: hk1.learnChuaDatTyLe || 0 }
        };
      }

      if (hk2) {
        this.summaryData.trainingQualityHK2 = {
          tot: { soLuong: hk2.trainTotSoLuong || 0, tyLe: hk2.trainTotTyLe || 0 },
          kha: { soLuong: hk2.trainKhaSoLuong || 0, tyLe: hk2.trainKhaTyLe || 0 },
          dat: { soLuong: hk2.trainDatSoLuong || 0, tyLe: hk2.trainDatTyLe || 0 },
          chuaDat: { soLuong: hk2.trainChuaDatSoLuong || 0, tyLe: hk2.trainChuaDatTyLe || 0 }
        };

        this.summaryData.learningQualityHK2 = {
          tot: { soLuong: hk2.learnTotSoLuong || 0, tyLe: hk2.learnTotTyLe || 0 },
          kha: { soLuong: hk2.learnKhaSoLuong || 0, tyLe: hk2.learnKhaTyLe || 0 },
          dat: { soLuong: hk2.learnDatSoLuong || 0, tyLe: hk2.learnDatTyLe || 0 },
          chuaDat: { soLuong: hk2.learnChuaDatSoLuong || 0, tyLe: hk2.learnChuaDatTyLe || 0 }
        };
      }
    }

    // === phần statistics/achievements giữ nguyên ===
    this.statisticsData.forEach(item => {
      this.summaryData.statistics[item.field] = item.soLuong || 0;
    });

    this.achievementsData.forEach(item => {
      this.summaryData.achievements[item.field] = item.soLuong || 0;
    });
  }


  onRefresh(): void {
    this.loadData();
  }

  private getEmptySummary(): ClassAnnualSummary {
    return {
      classId: '',
      className: '',
      schoolId: '',
      schoolYear: this.currentSchoolYear,
      gradeLevel: '',
      trainingQualityHK1: this.getEmptyQuality(),
      trainingQualityHK2: this.getEmptyQuality(),
      learningQualityHK1: this.getEmptyQuality(),
      learningQualityHK2: this.getEmptyQuality(),
      statistics: this.getEmptyStatistics(),
      achievements: this.getEmptyAchievements()
    };
  }

  private getEmptyQuality(): SemesterQuality {
    return {
      tot: { soLuong: 0, tyLe: 0 },
      kha: { soLuong: 0, tyLe: 0 },
      dat: { soLuong: 0, tyLe: 0 },
      chuaDat: { soLuong: 0, tyLe: 0 }
    };
  }

  private getEmptyStatistics(): StudentStatistics {
    return {
      soHocSinhDauNam: 0,
      soHocSinhCuoiKy1: 0,
      soHocSinhCuoiNam: 0,
      soHocSinhBoHocDoHocKem: 0,
      soHocSinhBoHocDoBenhTat: 0,
      soHocSinhBoHocDoHoanCanhKhoKhan: 0,
      soHocSinhBoHocDoLyDoKhac: 0
    };
  }

  private getEmptyAchievements(): AchievementStatistics {
    return {
      hocSinhChamTienDauNam: 0,
      hocSinhChamTienCuoiKy1: 0,
      hocSinhChamTienCuoiKy2: 0,
      hocSinhThiHSGCapQuanCum: 0,
      hocSinhThiHSGCapTP: 0,
      hocSinhDatHSGCapQuanCum: 0,
      xepLoaiLopCuoiKy1: 0,
      xepLoaiLopCuoiKy2: 0,
      xepLoaiChiDoiCuoiKy1: 0,
      xepLoaiChiDoiCuoiKy2: 0
    };
  }

  // ============= TEACHER ANNUAL REPORT METHODS =============

  private loadTeacherReport(): void {
    if (!this.currentTeacherId || !this.filterClassId) {
      this.teacherReport = null;
      this.buildTeacherReportDataSources();
      return;
    }

    const selectedClass = this.filterClassSource.find(c => c.id === this.filterClassId);

    this.teacherAnnualReportService.getMyReports(this.currentSchoolYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
          // Find report for current class
          const report = reports.find(r => r.mainClassId === this.filterClassId);
          if (report) {
            this.teacherReport = report;
            this.selectedReportType = report.reportType;
            // Update homeRoomClass to match current selected class
            if (this.teacherReport.selfAssessment && selectedClass) {
              this.teacherReport.selfAssessment.profile.homeRoomClass = selectedClass.name;
            }
          } else {
            // No report exists yet, create empty one
            this.teacherReport = this.getEmptyTeacherReport();
          }
          this.buildTeacherReportDataSources();
        },
        error: (error) => {
          console.error('Error loading teacher report:', error);
          this.teacherReport = this.getEmptyTeacherReport();
          this.buildTeacherReportDataSources();
        }
      });
  }

  private getEmptyTeacherReport(): TeacherAnnualReportDto {
    const selectedClass = this.filterClassSource.find(c => c.id === this.filterClassId);

    return {
      id: '',
      teacherId: this.currentTeacherId,
      teacherName: '',
      schoolId: this.currentSchoolId,
      schoolYear: this.currentSchoolYear,
      mainClassId: this.filterClassId,
      mainClassName: selectedClass?.name || '',
      reportType: this.selectedReportType,
      selfAssessment: {
        profile: {
          age: 0,
          gender: '',
          yearsOfExperience: 0,
          mainSubject: '',
          homeRoomClass: selectedClass?.name || '',
          teamRanking: '',
          unionRanking: '',
          workingConditions: ''
        },
        achievement: {
          homeRoomTeamRanking: '',
          yearlyActivities: '',
          effectiveMethods: ''
        },
        performanceIndicators: [],
        additional: {
          collectiveActivities: '',
          selfManagementStrengths: '',
          classTraditions: ''
        }
      },
      innovations: [],
      status: 0,
      createdDate: new Date(),
      updatedDate: new Date()
    };
  }

  private buildTeacherReportDataSources(): void {
    if (!this.teacherReport) {
      this.performanceIndicatorsData = [];
      return;
    }

    // Build performance indicators data
    if (this.teacherReport.selfAssessment?.performanceIndicators) {
      this.performanceIndicatorsData = this.teacherReport.selfAssessment.performanceIndicators.map((item, index) => ({
        order: index + 1,
        indicatorName: item.indicatorName,
        startOfYearPercent: item.startOfYearPercent,
        endOfYearPercent: item.endOfYearPercent
      }));
    } else {
      this.performanceIndicatorsData = [];
    }
  }

  onReportTypeChange(e: any): void {
    this.selectedReportType = e.value;
    if (this.teacherReport) {
      this.teacherReport.reportType = this.selectedReportType;
    }
  }

  onAddPerformanceIndicator(): void {
    const newIndicator = {
      order: this.performanceIndicatorsData.length + 1,
      indicatorName: '',
      startOfYearPercent: 0,
      endOfYearPercent: 0
    };
    this.performanceIndicatorsData = [...this.performanceIndicatorsData, newIndicator];
  }

  onDeletePerformanceIndicator(e: any): void {
    const index = this.performanceIndicatorsData.findIndex(item => item.order === e.row.data.order);
    if (index > -1) {
      this.performanceIndicatorsData.splice(index, 1);
      // Reorder
      this.performanceIndicatorsData.forEach((item, idx) => {
        item.order = idx + 1;
      });
      this.performanceIndicatorsData = [...this.performanceIndicatorsData];
    }
  }

  onAddInnovation(): void {
    if (!this.teacherReport) return;

    const newInnovation: InnovationReportDto = {
      title: '',
      subject: '',
      appliedToClass: '',
      theoreticalBasis: '',
      implementationMethods: '',
      results: '',
      lessonsLearned: ''
    };

    this.teacherReport.innovations = [...(this.teacherReport.innovations || []), newInnovation];
  }

  onDeleteInnovation(index: number): void {
    if (!this.teacherReport || !this.teacherReport.innovations) return;
    this.teacherReport.innovations.splice(index, 1);
    this.teacherReport.innovations = [...this.teacherReport.innovations];
  }

  onSaveTeacherReport(): void {
    if (!this.teacherReport) {
      notify('Không có dữ liệu để lưu', 'warning', 2000);
      return;
    }

    // Update performance indicators from grid
    if (this.teacherReport.selfAssessment) {
      this.teacherReport.selfAssessment.performanceIndicators = this.performanceIndicatorsData.map(item => ({
        order: item.order,
        indicatorName: item.indicatorName,
        startOfYearPercent: item.startOfYearPercent || 0,
        endOfYearPercent: item.endOfYearPercent || 0
      }));
    }

    this.isSaving = true;

    const saveObservable = this.teacherReport.id
      ? this.teacherAnnualReportService.update({
          id: this.teacherReport.id,
          selfAssessment: this.teacherReport.selfAssessment,
          innovations: this.teacherReport.innovations
        })
      : this.teacherAnnualReportService.create({
          schoolYear: this.currentSchoolYear,
          mainClassId: this.filterClassId,
          reportType: this.selectedReportType
        });

    saveObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          notify('Lưu báo cáo thành công', 'success', 2000);
          this.loadTeacherReport();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving teacher report:', error);
          notify('Có lỗi khi lưu báo cáo', 'error', 3000);
          this.isSaving = false;
        }
      });
  }
}
