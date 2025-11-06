import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import {
  LoginFormComponent,
  ResetPasswordFormComponent,
  CreateAccountFormComponent,
  ChangePasswordFormComponent,
} from './components';
import { AuthGuardService } from './services';

import { SideNavOuterToolbarComponent, UnauthenticatedContentComponent } from './layouts';

import { CrmContactListComponent } from './pages/crm-contact-list/crm-contact-list.component';
import { CrmContactDetailsComponent } from './pages/crm-contact-details/crm-contact-details.component';
import { PlanningTaskListComponent } from './pages/planning-task-list/planning-task-list.component';
import { PlanningTaskDetailsComponent } from './pages/planning-task-details/planning-task-details.component';
import { AnalyticsDashboardComponent } from './pages/analytics-dashboard/analytics-dashboard.component';
import { AnalyticsSalesReportComponent } from './pages/analytics-sales-report/analytics-sales-report.component';
import { AnalyticsGeographyComponent } from './pages/analytics-geography/analytics-geography.component';
import { PlanningSchedulerComponent } from './pages/planning-scheduler/planning-scheduler.component';
import { AppSignInComponent } from './pages/sign-in-form/sign-in-form.component';
import { AppSignUpComponent } from './pages/sign-up-form/sign-up-form.component';
import { AppResetPasswordComponent } from './pages/reset-password-form/reset-password-form.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import {SgdSsoComponent} from "./components/sgd-sso/sgd-sso.component";
import {PublicLessonComponent} from "./components/public-lesson/public-lesson.component";
import {ExternalRouteGuard} from "./guards/external-route.guard";
import {DummyComponent} from "./custom-pages/common/dummy/dummy.component";
import {AppPagesModule} from "./components/app-pages/app-pages.module";
const routes: Routes = [
  /*{ path: 'loginH5p', canActivate: [ExternalRouteGuard], component: DummyComponent },
  { path: 'h5p', canActivate: [ExternalRouteGuard], component: DummyComponent },*/
  {
    path: 'sso',
    component: SgdSsoComponent
  },
  {
    path: 'gop-y',
    component: SgdSsoComponent
  },
  {
    path: 'ischoolLogin',
    component: SgdSsoComponent
  },
  {
    path: 'public-lesson',
    component: PublicLessonComponent
  },
  {
    path: 'lesson-diary',
    //canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./components/app-pages/app-pages.module').then(
        (m) => m.AppPagesModule,
      ),
  },
  {
    path: 'auth',
    component: UnauthenticatedContentComponent,
    children: [
      {
        path: 'login',
        component: LoginFormComponent,
      },
      {
        path: 'reset-password',
        component: ResetPasswordFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'create-account',
        component: CreateAccountFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'change-password/:recoveryCode',
        component: ChangePasswordFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ]
  },
  {
    path: '',
    component: SideNavOuterToolbarComponent,
    children: [
      {
        path: 'mvp',
        data: { breadcrumb: 'F02 - Bảo hiểm ô tô' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/f02/f02.module').then(
            (m) => m.F02Module,
          ),
      },
      {
        path: 'common',
        data: { breadcrumb: 'Cấu hình & hệ thống' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/common/azi.common.module').then(
            (m) => m.AziCommonModule,
          ),
      },
      {
        path: 'exam',
        data: { breadcrumb: 'Thi trực tuyến' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/exam/exam.module').then(
            (m) => m.ExamModule,
          ),
      },
      {
        path: 'teacher',
        data: { breadcrumb: '' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/teacher/teacher.module').then(
            (m) => m.TeacherModule,
          ),
      },
      {
        path: 'student',
        data: { breadcrumb: '' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/student/student.module').then(
            (m) => m.StudentModule,
          ),
      },
      {
        path: 'transcript',
        data: { breadcrumb: '' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/digital-transcript/digital-transcript.module').then(
            (m) => m.DigitalTranscriptModule,
          ),
      },
      {
        path: 'edu',
        data: { breadcrumb: '' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/edu/edu.module').then(
            (m) => m.EduModule,
          ),
      },
      {
        path: 'class',
        data: { breadcrumb: '' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/classes/classes.module').then(
            (m) => m.ClassesModule,
          ),
      },
      {
        path: 'score-entry',
        data: { 
          breadcrumb: 'Nhập điểm',
          breadcrumbIcon: 'edit'
        },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/score-entry/score-entry.module').then(
            (m) => m.ScoreEntryModule,
          ),
      },
      {
        path: 'class-logbook',
        data: { 
          breadcrumb: 'Sổ chủ nhiệm',
          breadcrumbIcon: 'textdocument'
        },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/class-logbook/class-logbook.module').then(
            (m) => m.ClassLogbookModule,
          ),
      },
      {
      path: 'education-records',
        data: { 
          breadcrumb: 'Hồ sơ giáo dục',
          breadcrumbIcon: 'textdocument'
        },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./custom-pages/education-records/education-records.module').then(
            (m) => m.EducationRecordsModule,
          ),
      },
      {
        path: 'admin',
        data: { breadcrumb: '' },
        canActivate: [AuthGuardService],
        loadChildren: () =>
          import('./admin-pages/admin-pages.module').then(
            (m) => m.AdminPagesModule,
          ),
      },
      {
        path: 'crm-contact-list',
        component: CrmContactListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'crm-contact-details',
        component: CrmContactDetailsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'planning-task-list',
        component: PlanningTaskListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'planning-task-details',
        component: PlanningTaskDetailsComponent
      },
      {
        path: 'planning-scheduler',
        component: PlanningSchedulerComponent
      },
      {
        path: 'analytics-dashboard',
        component: AnalyticsDashboardComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'analytics-sales-report',
        component: AnalyticsSalesReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'analytics-geography',
        component: AnalyticsGeographyComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sign-in-form',
        component: AppSignInComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sign-up-form',
        component: AppSignUpComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'reset-password-form',
        component: AppResetPasswordComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'user-profile',
        component: UserProfileComponent
      },
      {
        path: '**',
        redirectTo: 'common',
        pathMatch: 'full',
      },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: false, }),
    BrowserModule,
  ],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [],
})
export class AppRoutingModule { }
