import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FullNamePipe, FullNamePipeModule} from "../pipes/full-name.pipe";
import {SafePipe, SafePipeModule} from "../pipes/safe.pipe";
import {DigitalTranscriptRoutingModule} from "../custom-pages/digital-transcript/digital-transcript-routing.module";
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
  DxToolbarModule,
  DxValidationGroupModule,
  DxValidatorModule
} from "devextreme-angular";
import {ContactPanelModule} from "../components/library/contact-panel/contact-panel.component";
import {ContactNewFormModule} from "../components/library/contact-new-form/contact-new-form.component";
import {
  CardActivitiesModule,
  ContactStatusModule,
  FormPhotoUploaderModule,
  FormPopupModule,
  FormTextboxModule, TickerCardModule
} from "../components";
import {CardAnalyticsModule} from "../components/library/card-analytics/card-analytics.component";
import {DxPieChartModule} from "devextreme-angular/ui/pie-chart";
import {NgxDocViewerModule} from "ngx-doc-viewer";
import {StarRatingModule} from "angular-star-rating";
import {NgxPaginationModule} from "ngx-pagination";
import {RangePipeModule} from "../pipes/range.pipe";
import {CountdownModule} from "ngx-countdown";
import {CarouselModule} from "ngx-bootstrap/carousel";
import {MathjaxModule} from "../components/utils/mathjax/mathjax.component";
import {PdfViewerModule} from "ng2-pdf-viewer";
import {QuillModule} from "ngx-quill";
import { StaffMngtComponent } from './staffs/staff-mngt/staff-mngt.component';
import {AdminPagesRoutingModule} from "./admin-pages-routing.module";

@NgModule({
  declarations: [
    StaffMngtComponent
  ],
  imports: [
    CommonModule,
    AdminPagesRoutingModule,
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
export class AdminPagesModule { }
