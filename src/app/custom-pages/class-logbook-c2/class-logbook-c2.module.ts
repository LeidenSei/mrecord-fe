import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StudentListC2Component } from './student-list-c2/student-list-c2.component';
import { SubjectTeacherListC2Component } from './subject-teacher-list-c2/subject-teacher-list-c2.component';
import { StudentRulesC2Component } from './student-rules-c2/student-rules-c2.component';
import { GroupManagementC2Component } from './group-management-c2/group-management-c2.component';
import { ClassLayoutC2Component } from './class-layout-c2/class-layout-c2.component';
import { ParentCommitteeC2Component } from './parent-committee-c2/parent-committee-c2.component';
import { EducationPlanC2Component } from './education-plan-c2/education-plan-c2.component';
import { HomeroomPlanC2Component } from './homeroom-plan-c2/homeroom-plan-c2.component';
import { MonthlyPlanC2Component } from './monthly-plan-c2/monthly-plan-c2.component';
import { StudentBehaviorTrackingC2Component } from './student-behavior-tracking-c2/student-behavior-tracking-c2.component';
import { MonthlyEvaluationC2Component } from './monthly-evaluation-c2/monthly-evaluation-c2.component';
import { ActivitiesC2Component } from './activities-c2/activities-c2.component';
import { MeetingsC2Component } from './meetings-c2/meetings-c2.component';
import { YearEndSummaryC2Component } from './year-end-summary-c2/year-end-summary-c2.component';
import { PrincipalCommentsC2Component } from './principal-comments-c2/principal-comments-c2.component';
import { PrintLogbookC2Component } from './print-logbook-c2/print-logbook-c2.component';
import { DxButtonModule, DxDataGridModule, DxDropDownButtonModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxRadioGroupModule, DxSelectBoxModule, DxTextAreaModule, DxToolbarModule } from 'devextreme-angular';
import { QuillModule } from 'ngx-quill';
import { DxiColumnModule } from 'devextreme-angular/ui/nested';
const routes: Routes = [
  { path: 'student-list', component: StudentListC2Component },
  { path: 'subject-teacher-list', component: SubjectTeacherListC2Component },
  { path: 'student-rules', component: StudentRulesC2Component },
  { path: 'group-management', component: GroupManagementC2Component },
  { path: 'class-layout', component: ClassLayoutC2Component },
  { path: 'parent-committee', component: ParentCommitteeC2Component },
  { path: 'education-plan', component: EducationPlanC2Component },
  { path: 'homeroom-plan', component: HomeroomPlanC2Component },
  { path: 'monthly-plan', component: MonthlyPlanC2Component },
  { path: 'student-behavior-tracking', component: StudentBehaviorTrackingC2Component },
  { path: 'monthly-evaluation', component: MonthlyEvaluationC2Component },
  { path: 'activities', component: ActivitiesC2Component },
  { path: 'meetings', component: MeetingsC2Component },
  { path: 'year-end-summary', component: YearEndSummaryC2Component },
  { path: 'principal-comments', component: PrincipalCommentsC2Component },
  { path: 'print-logbook', component: PrintLogbookC2Component },
];

@NgModule({
  declarations: [
    StudentListC2Component,
    SubjectTeacherListC2Component,
    StudentRulesC2Component,
    GroupManagementC2Component,
    ClassLayoutC2Component,
    ParentCommitteeC2Component,
    EducationPlanC2Component,
    HomeroomPlanC2Component,
    MonthlyPlanC2Component,
    StudentBehaviorTrackingC2Component,
    MonthlyEvaluationC2Component,
    ActivitiesC2Component,
    MeetingsC2Component,
    YearEndSummaryC2Component,
    PrincipalCommentsC2Component,
    PrintLogbookC2Component,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxToolbarModule,
    QuillModule.forRoot(),
    DxButtonModule,
    DxLoadPanelModule,
    DxSelectBoxModule,
    DxNumberBoxModule,
    DxTextAreaModule,
    DxRadioGroupModule,
    DxiColumnModule,
    DxLoadIndicatorModule
  ]
})
export class ClassLogbookC2Module {}
