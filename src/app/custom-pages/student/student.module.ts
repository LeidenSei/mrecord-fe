import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {DxPieChartModule} from 'devextreme-angular/ui/pie-chart';
import {
  DxBulletModule,
  DxButtonModule,
  DxChartModule,
  DxCheckBoxModule,
  DxDataGridModule, DxDateBoxModule,
  DxDropDownButtonModule,
  DxFileUploaderModule,
  DxFormModule, DxHtmlEditorModule,
  DxListModule,
  DxLoadPanelModule, DxNumberBoxModule,
  DxPopupModule, DxProgressBarModule,
  DxScrollViewModule,
  DxSelectBoxModule,
  DxTabPanelModule, DxTabsModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupModule,
  DxValidatorModule
} from 'devextreme-angular';
import {ContactPanelModule} from '../../components/library/contact-panel/contact-panel.component';
import {ContactNewFormModule} from '../../components/library/contact-new-form/contact-new-form.component';
import {
  CardActivitiesModule,
  ContactStatusModule,
  FormPhotoUploaderModule,
  FormPopupModule,
  FormTextboxModule, TickerCardModule
} from '../../components';
import {CardAnalyticsModule} from '../../components/library/card-analytics/card-analytics.component';
import {NgxDocViewerModule} from 'ngx-doc-viewer';
import {StarRatingModule} from 'angular-star-rating';
import {StudentRoutingModule} from "./student-routing.module";
import {StudentSchoolCourseComponent} from './student-school-course/student-school-course.component';
import {StudentClassCourseComponent} from './student-class-course/student-class-course.component';
import {StudentLessonComponent} from './student-lesson/student-lesson.component';
import {NgxPaginationModule} from "ngx-pagination";
import { StudentHomeworkComponent } from './student-homework/student-homework.component';
import { StudentExampaperComponent } from './student-exampaper/student-exampaper.component';
import {RangePipeModule} from "../../pipes/range.pipe";
import {CountdownModule} from "ngx-countdown";
import { StudentResultScoreComponent } from './student-result-score/student-result-score.component';
import {CarouselModule} from "ngx-bootstrap/carousel";
import {MathjaxModule} from "../../components/utils/mathjax/mathjax.component";
import {SafePipeModule} from "../../pipes/safe.pipe";
import {PdfViewerModule} from "ng2-pdf-viewer";

import { QuillModule } from "ngx-quill";
import { TestQuillComponent } from './test-quill/test-quill.component';
@NgModule({
  declarations: [

    StudentSchoolCourseComponent,
    StudentClassCourseComponent,
    StudentLessonComponent,
    StudentHomeworkComponent,
    StudentExampaperComponent,
    StudentResultScoreComponent,
    TestQuillComponent,
  ],
  imports: [
    CommonModule,
    StudentRoutingModule,
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
    DxListModule,
    NgxDocViewerModule,
    StarRatingModule.forRoot(),
    DxProgressBarModule,
    NgxPaginationModule,
    NgxPaginationModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxHtmlEditorModule,
    DxTabPanelModule,
    DxTabsModule,
    DxLoadPanelModule,
    RangePipeModule,
    CountdownModule,
    CarouselModule.forRoot(),
    MathjaxModule,
    SafePipeModule,
    PdfViewerModule,
    QuillModule.forRoot()
  ]
})
export class StudentModule {
  
}
