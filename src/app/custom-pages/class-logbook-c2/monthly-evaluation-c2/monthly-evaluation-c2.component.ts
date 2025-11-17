import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';
import { AuthService } from 'src/app/services';
import { GeneralService } from 'src/app/services/general.service';
import { MonthlyTrainingResultService, MonthlyTrainingResultDto } from 'src/app/services/month-training-result.service';

interface MonthlyEvaluationRow {
  stt: number;
  id?: string;
  idTerm1?: string;
  idTerm2?: string;
  studentId: string;
  bgdCode?: string;
  studentName?: string;
  classId: string;
  schoolId?: string;
  schoolYear: number;
  month8?: string;
  month9?: string;
  month10?: string;
  month11?: string;
  month12?: string;
  month1?: string;
  month2?: string;
  month3?: string;
  month4?: string;
  month5?: string;
}

@Component({
  selector: 'app-monthly-evaluation-c2',
  templateUrl: './monthly-evaluation-c2.component.html',
  styleUrls: ['./monthly-evaluation-c2.component.scss']
})
export class MonthlyEvaluationC2Component implements OnInit, OnDestroy {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;

  datas: MonthlyEvaluationRow[] = [];
  students: any[] = [];

  // Filter sources
  gradeSource = [];
  classSource = [];
  filterClassSource = [];

  // Selected filters
  filterGrade: any;
  filterClassId: any;


  // Evaluation options
  evaluationSource = [
    { id: 'Đ', name: 'Đ - Đạt' },
    { id: 'CĐ', name: 'CĐ - Chưa đạt' },
    { id: 'T', name: 'T - Tốt' },
    { id: 'K', name: 'K - Khá' }
  ];

  // User info
  currentSchoolId: string = '';
  currentSchoolYear: number = new Date().getFullYear();

  isLoading = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private generalService: GeneralService,
    private monthlyTrainingResultService: MonthlyTrainingResultService
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

    // Load data for both terms
    forkJoin([
      this.generalService.getListStudentByClass(this.filterClassId),
      this.monthlyTrainingResultService.getListByClass(this.filterClassId, this.currentSchoolYear, 1),
      this.monthlyTrainingResultService.getListByClass(this.filterClassId, this.currentSchoolYear, 2)
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([students, resultsTerm1, resultsTerm2]) => {
        this.students = students || [];
        this.buildDataSource(resultsTerm1 || [], resultsTerm2 || []);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        notify('Có lỗi khi tải dữ liệu', 'error', 3000);
        this.isLoading = false;
      }
    });
  }

  private buildDataSource(resultsTerm1: MonthlyTrainingResultDto[], resultsTerm2: MonthlyTrainingResultDto[]): void {
    const dataMap = new Map();
    let stt = 1;

    // Add all students
    this.students.forEach(student => {
      dataMap.set(student.id, {
        stt: stt++,
        id: undefined,
        idTerm1: undefined,
        idTerm2: undefined,
        studentId: student.id,
        bgdCode: student.code || student.mA_HOC_SINH || student.bgdCode || '',
        studentName: student.name || student.teN_HOC_SINH || student.fullName || '',
        classId: this.filterClassId,
        schoolId: this.currentSchoolId,
        schoolYear: this.currentSchoolYear,
        month8: '',
        month9: '',
        month10: '',
        month11: '',
        month12: '',
        month1: '',
        month2: '',
        month3: '',
        month4: '',
        month5: ''
      });
    });

    // Merge results data from term 1 (months 8-12)
    resultsTerm1.forEach(result => {
      const studentId = result.studentId;
      if (dataMap.has(studentId)) {
        const existing = dataMap.get(studentId);
        existing.idTerm1 = result.id;
        existing.month8 = result.month8 || '';
        existing.month9 = result.month9 || '';
        existing.month10 = result.month10 || '';
        existing.month11 = result.month11 || '';
        existing.month12 = result.month12 || '';
      }
    });

    // Merge results data from term 2 (months 1-5)
    resultsTerm2.forEach(result => {
      const studentId = result.studentId;
      if (dataMap.has(studentId)) {
        const existing = dataMap.get(studentId);
        existing.idTerm2 = result.id;
        existing.month1 = result.month1 || '';
        existing.month2 = result.month2 || '';
        existing.month3 = result.month3 || '';
        existing.month4 = result.month4 || '';
        existing.month5 = result.month5 || '';
      }
    });

    this.datas = Array.from(dataMap.values());
  }

  onSave(): void {
    if (!this.datas || this.datas.length === 0) {
      notify('Không có dữ liệu để lưu', 'warning', 2000);
      return;
    }

    this.isSaving = true;

    // Prepare data for bulk update - split by term
    const dataToSaveTerm1 = this.datas.map(row => ({
      id: row['idTerm1'],
      studentId: row.studentId,
      bgdCode: row.bgdCode,
      classId: row.classId,
      schoolId: this.currentSchoolId,
      schoolYear: this.currentSchoolYear,
      term: 1,
      month8: row.month8 || null,
      month9: row.month9 || null,
      month10: row.month10 || null,
      month11: row.month11 || null,
      month12: row.month12 || null,
      month1: null,
      month2: null,
      month3: null,
      month4: null,
      month5: null
    }));

    const dataToSaveTerm2 = this.datas.map(row => ({
      id: row['idTerm2'],
      studentId: row.studentId,
      bgdCode: row.bgdCode,
      classId: row.classId,
      schoolId: this.currentSchoolId,
      schoolYear: this.currentSchoolYear,
      term: 2,
      month8: null,
      month9: null,
      month10: null,
      month11: null,
      month12: null,
      month1: row.month1 || null,
      month2: row.month2 || null,
      month3: row.month3 || null,
      month4: row.month4 || null,
      month5: row.month5 || null
    }));

    forkJoin([
      this.monthlyTrainingResultService.bulkUpdate(dataToSaveTerm1),
      this.monthlyTrainingResultService.bulkUpdate(dataToSaveTerm2)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notify('Lưu dữ liệu thành công', 'success', 2000);
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

  onRefresh(): void {
    this.loadData();
  }

  customizeText(cellInfo: any): string {
    return cellInfo.value || '';
  }
}
