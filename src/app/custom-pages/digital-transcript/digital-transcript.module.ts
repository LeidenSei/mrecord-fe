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
import {NgxPaginationModule} from "ngx-pagination";
import {RangePipeModule} from "../../pipes/range.pipe";
import {CountdownModule} from "ngx-countdown";
import {CarouselModule} from "ngx-bootstrap/carousel";
import {MathjaxModule} from "../../components/utils/mathjax/mathjax.component";
import {SafePipe, SafePipeModule} from "../../pipes/safe.pipe";
import {PdfViewerModule} from "ng2-pdf-viewer";

import { QuillModule } from "ngx-quill";
import { TranscriptListComponent } from './transcript-list/transcript-list.component';
import {DigitalTranscriptRoutingModule} from "./digital-transcript-routing.module";
import {FullNamePipe, FullNamePipeModule} from "../../pipes/full-name.pipe";
import { StudentSyncListComponent } from './student-sync-list/student-sync-list.component';
import { TranscriptPackagedComponent } from './transcript-packaged/transcript-packaged.component';
import {TeacherHomeroomCommentComponent} from "./teacher-homeroom-comment/teacher-homeroom-comment.component";
import {TeacherHomeroomApprovalComponent} from "./teacher-homeroom-approval/teacher-homeroom-approval.component";
import {TeacherSubjectApprovalComponent} from "./teacher-subject-approval/teacher-subject-approval.component";
import { TranscriptListSignReleaseComponent } from './transcript-list-sign-release/transcript-list-sign-release.component';
import { TranscriptListBySubjectTeacherComponent } from './transcript-list-by-subject-teacher/transcript-list-by-subject-teacher.component';
import { PrincipalSubjectApprovalComponent } from './principal-subject-approval/principal-subject-approval.component';
import {StudentSyncListC1Component} from "./student-sync-list-c1/student-sync-list-c1.component";
import { TranscriptListC1Component } from './transcript-list-c1/transcript-list-c1.component';
import { TranscriptSubjectTeacherSignedByPrincipalComponent } from './transcript-subject-teacher-signed-by-principal/transcript-subject-teacher-signed-by-principal.component';
import { TranscriptListSignReleaseC1Component } from './transcript-list-sign-release-c1/transcript-list-sign-release-c1.component';
import { StudentSyncListC2Component } from './student-sync-list-c2/student-sync-list-c2.component';
import { PrincipalSubjectApprovalV2Component } from './principal-subject-approval-v2/principal-subject-approval-v2.component';


@NgModule({
  declarations: [
    TranscriptListComponent,
    StudentSyncListComponent,
    StudentSyncListC1Component,
    TranscriptPackagedComponent,
    TeacherHomeroomApprovalComponent,
    TeacherSubjectApprovalComponent,
    TeacherHomeroomCommentComponent,
    TranscriptListSignReleaseComponent,
    TranscriptListBySubjectTeacherComponent,
    PrincipalSubjectApprovalComponent,
    TranscriptListC1Component,
    TranscriptSubjectTeacherSignedByPrincipalComponent,
    TranscriptListSignReleaseC1Component,
    StudentSyncListC2Component,
    PrincipalSubjectApprovalV2Component,
  ],
  imports: [
    CommonModule,
    DigitalTranscriptRoutingModule,
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
    FullNamePipeModule,
    QuillModule.forRoot(),
  ],
  providers: [
    FullNamePipe, SafePipe
  ],
})
export class DigitalTranscriptModule { }
