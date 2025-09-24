import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentExampaperResultDetailComponent } from './components/student-exampaper-result-detail/student-exampaper-result-detail.component';
import {
  DxBulletModule,
  DxButtonModule,
  DxChartModule,
  DxCheckBoxModule,
  DxDataGridModule, DxDateBoxModule,
  DxDropDownButtonModule,
  DxFileUploaderModule,
  DxFormModule, DxGalleryModule, DxHtmlEditorModule, DxListModule,
  DxLoadPanelModule, DxNumberBoxModule,
  DxPieChartModule,
  DxPopupModule, DxProgressBarModule,
  DxScrollViewModule,
  DxSelectBoxModule, DxTabPanelModule, DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupModule,
  DxValidatorModule
} from "devextreme-angular";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {NgxDocViewerModule} from "ngx-doc-viewer";
import {StarRatingModule} from "angular-star-rating";
import {NgxPaginationModule} from "ngx-pagination";
import {MathjaxModule} from "../components/utils/mathjax/mathjax.component";
import {CkeditorComponent} from "../custom-pages/controls/ckeditor/ckeditor.component";
import {H5PModule} from "../custom-pages/controls/h5p/h5p.module";
import {CKEditorModule} from "ckeditor4-angular";
import {RoundPipeModule} from "../pipes/round.pipe";
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [
    StudentExampaperResultDetailComponent,
    BreadcrumbComponent
  ],
  imports: [
    CommonModule,
    DxTemplateModule,
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
    RoundPipeModule
  ],
  exports: [
    StudentExampaperResultDetailComponent,
    BreadcrumbComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Thêm CUSTOM_ELEMENTS_SCHEMA để Angular hỗ trợ Web Components
})
export class SharedModule { }
