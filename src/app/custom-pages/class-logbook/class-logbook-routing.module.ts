import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClassCommitteeComponent } from './class-committee/class-committee.component';
import { ClassNotesComponent } from './class-notes/class-notes.component';
import { GoodDeedsComponent } from './good-deeds/good-deeds.component';
import { ParentCommitteeComponent } from './parent-committee/parent-committee.component';
import { HomeroomPlanComponent } from './homeroom-plan/homeroom-plan.component';
import { MonthlyPlanComponent } from './monthly-plan/monthly-plan.component';
import { MidtermAssessmentComponent } from './midterm-assessment/midterm-assessment.component';
import { FinalAssessmentComponent } from './final-assessment/final-assessment.component';
import { SemesterCommentsComponent } from './semester-comments/semester-comments.component';
import { StudentTrackingComponent } from './student-tracking/student-tracking.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'class-committee',
    pathMatch: 'full'
  },
  {
    path: 'class-committee',
    component: ClassCommitteeComponent,
    data: { 
      breadcrumb: 'Ban cán sự lớp',
      breadcrumbIcon: 'user'
    }
  },
  {
    path: 'class-notes',
    component: ClassNotesComponent,
    data: { 
      breadcrumb: 'Lưu ý nhận lớp',
      breadcrumbIcon: 'edit'
    }
  },
  {
    path: 'good-deeds',
    component: GoodDeedsComponent,
    data: { 
      breadcrumb: 'Hoa việc tốt',
      breadcrumbIcon: 'taskcomplete'
    }
  },
  {
    path: 'parent-committee',
    component: ParentCommitteeComponent,
    data: { 
      breadcrumb: 'Danh sách ban đại diện cha mẹ học sinh',
      breadcrumbIcon: 'user'
    }
  },
  {
    path: 'homeroom-plan',
    component: HomeroomPlanComponent,
    data: { 
      breadcrumb: 'Kế hoạch chủ nhiệm',
      breadcrumbIcon: 'bookmark'
    }
  },
  {
    path: 'monthly-plan',
    component: MonthlyPlanComponent,
    data: { 
      breadcrumb: 'Kế hoạch tháng',
      breadcrumbIcon: 'bookmark'
    }
  },
  {
    path: 'midterm-assessment',
    component: MidtermAssessmentComponent,
    data: { 
      breadcrumb: 'Bảng tổng hợp kết quả đánh giá giáo dục giữa kỳ (GK)',
      breadcrumbIcon: 'checklist'
    }
  },
  {
    path: 'final-assessment',
    component: FinalAssessmentComponent,
    data: { 
      breadcrumb: 'Bảng tổng hợp kết quả đánh giá giáo dục cuối kỳ (CK)',
      breadcrumbIcon: 'checklist'
    }
  },
  {
    path: 'semester-comments',
    component: SemesterCommentsComponent,
    data: { 
      breadcrumb: 'Nhận xét tình hình lớp học',
      breadcrumbIcon: 'textdocument'
    }
  },
  {
    path: 'student-tracking',
    component: StudentTrackingComponent,
    data: { 
      breadcrumb: 'Theo dõi học sinh',
      breadcrumbIcon: 'textdocument'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassLogbookRoutingModule { }