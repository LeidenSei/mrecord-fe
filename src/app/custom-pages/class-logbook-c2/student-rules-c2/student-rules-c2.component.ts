import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services'; // Điều chỉnh đường dẫn
import { SchoolService } from '../../../services/school.service'; // Điều chỉnh đường dẫn
import { NotificationService } from '../../../services/notification.service'; // Điều chỉnh đường dẫn
import { Constant } from 'src/app/shared/constants/constant.class';

@Component({
  selector: 'app-student-rules-c2',
  templateUrl: './student-rules-c2.component.html',
  styleUrls: ['./student-rules-c2.component.scss']
})
export class StudentRulesC2Component implements OnInit {
  activeTab: 'rules' | 'criteria' = 'rules';
  schoolId: string = '';

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
    private schoolService: SchoolService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.schoolId = user.data.schoolId;
    
    if (this.schoolId) {
      this.loadSchoolConfig();
    }
  }

  loadSchoolConfig() {
    this.schoolService.getSchoolById(this.schoolId).subscribe({
      next: (school) => {
        this.form.patchValue({
          rules: school.studentBehaviorRules || '',
          criteria1: school.classExcellenceCriteria1 || '',
          criteria2: school.classExcellenceCriteria2 || '',
          criteria3: school.classExcellenceCriteria3 || '',
          criteria4: school.classExcellenceCriteria4 || '',
          criteria5: school.classExcellenceCriteria5 || '',
          criteria6: school.classExcellenceCriteria6 || '',
          criteria7: school.classExcellenceCriteria7 || ''
        });
      },
      error: (err) => {

      }
    });
  }

  switch(tab: 'rules' | 'criteria') {
    this.activeTab = tab;
  }

  save() {
    const formValue = this.form.value;
    
    const config = {
      id: this.schoolId,
      studentBehaviorRules: formValue.rules,
      classExcellenceCriteria1: formValue.criteria1,
      classExcellenceCriteria2: formValue.criteria2,
      classExcellenceCriteria3: formValue.criteria3,
      classExcellenceCriteria4: formValue.criteria4,
      classExcellenceCriteria5: formValue.criteria5,
      classExcellenceCriteria6: formValue.criteria6,
      classExcellenceCriteria7: formValue.criteria7
    };

    this.schoolService.saveSchoolConfig(config).subscribe({
      next: (response) => {
        console.log('Lưu thành công:', response);
         this.notificationService.showNotification(Constant.SUCCESS, 'Lưu cấu hình thành công!');
      },
      error: (err) => {
          this.notificationService.showNotification(Constant.ERROR, 'Lưu cấu hình thất bại!');
      }
    });
  }
}