import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StudentRoutingModule} from "../../custom-pages/student/student-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  DxBulletModule,
  DxButtonModule,
  DxChartModule,
  DxCheckBoxModule,
  DxDataGridModule, DxDateBoxModule,
  DxDropDownButtonModule,
  DxFileUploaderModule,
  DxFormModule, DxHtmlEditorModule, DxListModule,
  DxLoadPanelModule, DxNumberBoxModule,
  DxPopupModule, DxProgressBarModule,
  DxScrollViewModule,
  DxSelectBoxModule, DxTabPanelModule, DxTabsModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule, DxTreeListModule,
  DxValidationGroupModule,
  DxValidatorModule
} from "devextreme-angular";
import {ContactPanelModule} from "../library/contact-panel/contact-panel.component";
import {ContactNewFormModule} from "../library/contact-new-form/contact-new-form.component";
import {FormPopupModule} from "../utils/form-popup/form-popup.component";
import {CardActivitiesModule} from "../library/card-activities/card-activities.component";
import {ContactStatusModule} from "../utils/contact-status/contact-status.component";
import {FormTextboxModule} from "../utils/form-textbox/form-textbox.component";
import {FormPhotoUploaderModule} from "../utils/form-photo-uploader/form-photo-uploader.component";
import {TickerCardModule} from "../library/ticker-card/ticker-card.component";
import {CardAnalyticsModule} from "../library/card-analytics/card-analytics.component";
import {DxPieChartModule} from "devextreme-angular/ui/pie-chart";
import {NgxDocViewerModule} from "ngx-doc-viewer";
import {StarRatingModule} from "angular-star-rating";
import {NgxPaginationModule} from "ngx-pagination";
import {RangePipeModule} from "../../pipes/range.pipe";
import {CountdownModule} from "ngx-countdown";
import {CarouselModule} from "ngx-bootstrap/carousel";
import {MathjaxModule} from "../utils/mathjax/mathjax.component";
import {SafePipe, SafePipeModule} from "../../pipes/safe.pipe";
import {PdfViewerModule} from "ng2-pdf-viewer";
import {QuillModule} from "ngx-quill";
import {AppPagesRoutingModule} from "./app-pages-routing.module";
import { SubjectTeacherDiaryComponent } from './subject-teacher-diary/subject-teacher-diary.component';
import {FullNamePipe, FullNamePipeModule} from "../../pipes/full-name.pipe";


@NgModule({
  declarations: [
    SubjectTeacherDiaryComponent
  ],
  imports: [
    CommonModule,
    AppPagesRoutingModule,
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
    QuillModule.forRoot(),
    DxTreeListModule,
    FullNamePipeModule
  ],
  providers: [
    FullNamePipe, SafePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppPagesModule { }
