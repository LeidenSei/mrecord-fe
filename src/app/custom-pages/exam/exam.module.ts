import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExamRoutingModule} from "./exam-routing.module";
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
  DxPieChartModule,
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
import {NgxDocViewerModule} from "ngx-doc-viewer";
import {StarRatingModule} from "angular-star-rating";
import {NgxPaginationModule} from "ngx-pagination";
import {MathjaxModule} from "../../components/utils/mathjax/mathjax.component";
import { DigiExamComponent } from './digi-exam/digi-exam.component';
import {CkeditorComponent} from "../controls/ckeditor/ckeditor.component";



@NgModule({
  declarations: [
    DigiExamComponent
  ],
  imports: [

    CommonModule,
    ExamRoutingModule,
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
    CkeditorComponent
  ]
})
export class ExamModule { }
