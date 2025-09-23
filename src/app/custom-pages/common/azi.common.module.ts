import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {DxPieChartModule} from 'devextreme-angular/ui/pie-chart';
import {
  DxBulletModule,
  DxButtonModule,
  DxChartModule,
  DxCheckBoxModule,
  DxDataGridModule, DxDateBoxModule,
  DxDropDownButtonModule,
  DxFileUploaderModule,
  DxFormModule,
  DxListModule,
  DxLoadPanelModule, DxNumberBoxModule,
  DxPopupModule, DxProgressBarModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupModule,
  DxValidatorModule
} from "devextreme-angular";
import {ContactPanelModule} from "../../components/library/contact-panel/contact-panel.component";
import {ContactNewFormModule} from "../../components/library/contact-new-form/contact-new-form.component";
import {
  CardActivitiesModule,
  ContactStatusModule,
  FormPhotoUploaderModule,
  FormPopupModule,
  FormTextboxModule, TickerCardModule
} from "../../components";
import {AziCommonRoutingModule} from "./azi.common-routing.module";
import {UserListComponent} from './user-list/user-list.component';
import {HomePageComponent} from './home-page/home-page.component';
import {CardAnalyticsModule} from "../../components/library/card-analytics/card-analytics.component";
import {SubjectRoleApproveComponent} from './subject-role-approve/subject-role-approve.component';
import {FullNamePipe, FullNamePipeModule} from "../../pipes/full-name.pipe";
import {NgxDocViewerModule} from "ngx-doc-viewer";
import {StarRatingModule} from "angular-star-rating";
import {NgxPaginationModule} from "ngx-pagination";
import { LessonStatsticTeacherComponent } from './lesson-statstic-teacher/lesson-statstic-teacher.component';
import { TeacherLessonDetailComponent } from './teacher-lesson-detail/teacher-lesson-detail.component';
import { DummyComponent } from './dummy/dummy.component';
import { MessageStatisticTeacherComponent } from './message-statistic-teacher/message-statistic-teacher.component';
import { LessonListTeacherComponent } from './lesson-list-teacher/lesson-list-teacher.component';
import { StudentCompletionRateComponent } from './student-completion-rate/student-completion-rate.component';
import { HomeworkCompletionStatisticsComponent } from './homework-completion-statistics/homework-completion-statistics.component';
import { SgdDataSyncComponent } from './sgd-data-sync/sgd-data-sync.component';


@NgModule({
  declarations: [
    UserListComponent,
    HomePageComponent,
    SubjectRoleApproveComponent,
    LessonStatsticTeacherComponent,
    TeacherLessonDetailComponent,
    DummyComponent,
    MessageStatisticTeacherComponent,
    LessonListTeacherComponent,
    StudentCompletionRateComponent,
    HomeworkCompletionStatisticsComponent,
    SgdDataSyncComponent,
  ],
  imports: [
    CommonModule,
    AziCommonRoutingModule,
    FormsModule,
    DxFormModule,
    ReactiveFormsModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,

    ContactPanelModule,
    ContactNewFormModule,
    FormPopupModule,
    CardActivitiesModule,
    ContactStatusModule,
    DxToolbarModule,
    DxScrollViewModule,
    DxLoadPanelModule,
    DxTextBoxModule,
    FormTextboxModule,
    FormPhotoUploaderModule,
    DxValidatorModule,
    TickerCardModule,
    CardAnalyticsModule,
    DxPieChartModule,
    DxChartModule,
    DxBulletModule,
    DxPopupModule,
    DxValidationGroupModule,
    DxTextAreaModule,
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxTagBoxModule,
    DxTabPanelModule,
    DxTabsModule,
    DxListModule,
    NgxDocViewerModule,
    StarRatingModule.forRoot(),
    DxProgressBarModule,
    NgxPaginationModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    FullNamePipeModule,
  ],
  providers: [
    FullNamePipe  // Thêm vào providers để sử dụng trong TS code
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AziCommonModule {
}
