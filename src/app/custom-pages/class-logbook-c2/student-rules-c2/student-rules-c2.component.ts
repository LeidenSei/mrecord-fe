import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../services';
import { ClassService } from '../../../services/class.service';
import { GeneralService } from '../../../services/general.service';
import { NotificationService } from '../../../services/notification.service';
import { Constant } from 'src/app/shared/constants/constant.class';

@Component({
  selector: 'app-student-rules-c2',
  templateUrl: './student-rules-c2.component.html',
  styleUrls: ['./student-rules-c2.component.scss']
})
export class StudentRulesC2Component implements OnInit, OnDestroy {
  activeTab: 'rules' | 'criteria' = 'rules';

  // Filter sources
  gradeSource = [];
  classSource = [];
  filterClassSource = [];

  // Selected filters
  filterGrade: any;
  filterClassId: any;

  // User info
  currentSchoolId: string = '';
  currentClassName: string = '';

  isLoading = false;
  private destroy$ = new Subject<void>();

  form: FormGroup = this.fb.group({
    rules: [''],
    criteria1: [''],
    criteria2: [''],
    criteria3: [''],
    criteria4: [''],
    criteria5: [''],
    criteria6: [''],
    criteria7: ['']
  });

  // Toolbar gọn kiểu "chat editor"
  toolbar: any = [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    [{ 'font': [] }, { 'size': [] }],
    ['link', 'code-block']
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private classService: ClassService,
    private generalService: GeneralService,
    private notificationService: NotificationService
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
            this.currentClassName = this.filterClassSource[0].name;
            this.loadClassRulesAndCriteria();
          }
        },
        error: (error) => {
          console.error('Error loading initial data:', error);
          this.notificationService.showNotification(Constant.ERROR, 'Có lỗi khi tải dữ liệu ban đầu');
        }
      });
    } catch (error) {
      console.error('Error in initialization:', error);
      this.notificationService.showNotification(Constant.ERROR, 'Có lỗi khi khởi tạo');
    }
  }

  gradeChange($event: any): void {
    const selectedGrade = $event.value;
    if (!Number.isNaN(selectedGrade) && selectedGrade !== null && selectedGrade !== undefined) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +selectedGrade);
    } else {
      this.filterClassSource = this.classSource;
    }

    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
      this.currentClassName = this.filterClassSource[0].name;
      this.loadClassRulesAndCriteria();
    }
  }

  classChange($event: any): void {
    if (!$event.value) return;

    this.filterClassId = $event.value;
    const selectedClass = this.filterClassSource.find(c => c.id === $event.value);
    if (selectedClass) {
      this.currentClassName = selectedClass.name;
      this.loadClassRulesAndCriteria();
    }
  }

  loadClassRulesAndCriteria() {
    if (!this.filterClassId) {
      return;
    }

    this.isLoading = true;
    this.classService.getClassRulesAndCriteria(this.filterClassId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.form.patchValue({
            rules: data.studentBehaviorRules || '',
            criteria1: data.classExcellenceCriteria1 || '',
            criteria2: data.classExcellenceCriteria2 || '',
            criteria3: data.classExcellenceCriteria3 || '',
            criteria4: data.classExcellenceCriteria4 || '',
            criteria5: data.classExcellenceCriteria5 || '',
            criteria6: data.classExcellenceCriteria6 || '',
            criteria7: data.classExcellenceCriteria7 || ''
          });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading class rules:', err);
          this.notificationService.showNotification(Constant.ERROR, 'Có lỗi khi tải quy định lớp');
          this.isLoading = false;
        }
      });
  }

  switch(tab: 'rules' | 'criteria') {
    this.activeTab = tab;
  }

  save() {
    if (!this.filterClassId) {
      this.notificationService.showNotification(Constant.WARNING, 'Vui lòng chọn lớp');
      return;
    }

    const formValue = this.form.value;

    this.classService.saveClassRulesAndCriteria(
      this.filterClassId,
      formValue.rules,
      formValue.criteria1,
      formValue.criteria2,
      formValue.criteria3,
      formValue.criteria4,
      formValue.criteria5,
      formValue.criteria6,
      formValue.criteria7
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        // Kiểm tra response.code để xác định thành công hay thất bại
        if (response.code === 0) {
          console.log('Lưu thành công:', response);
          this.notificationService.showNotification(Constant.SUCCESS, 'Lưu quy định và tiêu chuẩn thành công!');
        } else {
          // Backend trả về error code nhưng HTTP status vẫn là 200
          const errorMessage = response.messageCode || response.message || 'Lưu quy định và tiêu chuẩn thất bại!';
          console.error('Error from backend:', response);
          this.notificationService.showNotification(Constant.ERROR, errorMessage);
        }
      },
      error: (err) => {
        console.error('Error saving:', err);
        const errorMessage = err?.error?.messageCode || err?.error?.message || 'Lưu quy định và tiêu chuẩn thất bại!';
        this.notificationService.showNotification(Constant.ERROR, errorMessage);
      }
    });
  }
}