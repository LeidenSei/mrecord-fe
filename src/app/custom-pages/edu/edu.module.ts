import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {NgxDocViewerModule} from "ngx-doc-viewer";
import {StarRatingModule} from "angular-star-rating";
import {NgxPaginationModule} from "ngx-pagination";
import {MathjaxModule} from "../../components/utils/mathjax/mathjax.component";
import {CkeditorComponent} from "../controls/ckeditor/ckeditor.component";
import {H5PModule} from "../controls/h5p/h5p.module";
import {CKEditorModule} from "ckeditor4-angular";
import {SharedModule} from "../../shared/shared.module";
import {FullNamePipe, FullNamePipeModule} from "../../pipes/full-name.pipe";
import {SafePipe, SafePipeModule} from "../../pipes/safe.pipe";
import {RoundPipeModule} from "../../pipes/round.pipe";
import {EduRoutingModule} from "./edu-routing.module";
import { SharedCourseComponent } from './shared-course/shared-course.component';



@NgModule({
  declarations: [
  
    SharedCourseComponent
  ],
  imports: [
    CommonModule,
    EduRoutingModule,
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
export class EduModule { }
