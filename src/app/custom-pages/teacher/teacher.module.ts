import {NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import { DxPieChartModule } from 'devextreme-angular/ui/pie-chart';
import {
  DxBulletModule,
  DxButtonModule,
  DxChartModule,
  DxCheckBoxModule,
  DxDataGridModule, DxDateBoxModule,
  DxDropDownButtonModule,
  DxFileUploaderModule,
  DxFormModule, DxGalleryModule, DxHtmlEditorModule,
  DxListModule,
  DxLoadPanelModule, DxNumberBoxModule,
  DxPopupModule, DxProgressBarModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTabPanelModule, DxTabsModule,
  DxTagBoxModule, DxTemplateModule,
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
import {CardAnalyticsModule} from "../../components/library/card-analytics/card-analytics.component";
import {TeacherRoutingModule} from "./teacher-routing.module";
import { CourseSchoolComponent } from './course-school/course-school.component';
import { TeacherCourseComponent } from './teacher-course/teacher-course.component';
import { TeacherLessonComponent } from './teacher-lesson/teacher-lesson.component';
import { LessonEditorComponent } from './lesson-editor/lesson-editor.component';
import { LessonPlayerComponent } from './lesson-player/lesson-player.component';
import {NgxDocViewerModule} from "ngx-doc-viewer";
import {StarRatingModule} from "angular-star-rating";
import { ApprovalCourseComponent } from './approval-course/approval-course.component';
import {NgxPaginationModule} from "ngx-pagination";
import { TeacherHomeworkComponent } from './teacher-homework/teacher-homework.component';
import { MeetingOnlineComponent } from './meeting-online/meeting-online.component';
import { TeacherExamPaperComponent } from './teacher-exam-paper/teacher-exam-paper.component';
import { ApproveLessonComponent } from './approve-lesson/approve-lesson.component';
import { SubjectCourseComponent } from './subject-course/subject-course.component';
import { StudentClassComponent } from './student-class/student-class.component';
import { StudentLessonMarkComponent } from './student-lesson-mark/student-lesson-mark.component';
import {MathjaxModule} from "../../components/utils/mathjax/mathjax.component";
import {CkeditorComponent} from "../controls/ckeditor/ckeditor.component";
import { StudentLessonScoreComponent } from './student-lesson-score/student-lesson-score.component';
import { StudentLessonClassScoreComponent } from './student-lesson-class-score/student-lesson-class-score.component';
import { SharedCourseComponent } from './shared-course/shared-course.component';
import {H5PModule} from "../controls/h5p/h5p.module";
import {CKEditorModule} from "ckeditor4-angular";
import { TeacherExamPaperAutoComponent } from './teacher-exam-paper-auto/teacher-exam-paper-auto.component';
import {SharedModule} from "../../shared/shared.module";
import {FullNamePipe, FullNamePipeModule} from "../../pipes/full-name.pipe";
import {SafePipe, SafePipeModule} from "../../pipes/safe.pipe";
import {RoundPipe, RoundPipeModule} from "../../pipes/round.pipe";
import { StatisticContentComponent } from './statistic-content/statistic-content.component';
import { TeachingPlanComponent } from './teaching-plan/teaching-plan.component';
import { ApprovalTeachingPlanComponent } from './approval-teaching-plan/approval-teaching-plan.component';
@NgModule({
  declarations: [

    CourseSchoolComponent,
       TeacherCourseComponent,
       TeacherLessonComponent,
       LessonEditorComponent,
       LessonPlayerComponent,
       ApprovalCourseComponent,
       TeacherHomeworkComponent,
       MeetingOnlineComponent,
       TeacherExamPaperComponent,
       ApproveLessonComponent,
       SubjectCourseComponent,
       StudentClassComponent,
       StudentLessonMarkComponent,
       StudentLessonScoreComponent,
       StudentLessonClassScoreComponent,
       SharedCourseComponent,
       TeacherExamPaperAutoComponent,
       StatisticContentComponent,
       TeachingPlanComponent,
       ApprovalTeachingPlanComponent
  ],
  imports: [
    CommonModule,
    TeacherRoutingModule,
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
    DxHtmlEditorModule,
    MathjaxModule,
    CkeditorComponent,
    H5PModule,
    CKEditorModule,
    DxGalleryModule,
    DxTemplateModule,
    SharedModule,
    FullNamePipeModule,
    SafePipeModule,
    RoundPipeModule,
  ],
  providers: [
    FullNamePipe, SafePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class TeacherModule { }
