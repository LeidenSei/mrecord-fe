import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ClassesRoutingModule} from "./classes-routing.module";
import { ClassListComponent } from './class-list/class-list.component';
import { ClassCustomListComponent } from './class-custom-list/class-custom-list.component';
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
import {FullNamePipe, FullNamePipeModule} from "../../pipes/full-name.pipe";

@NgModule({
  declarations: [
    ClassListComponent,
    ClassCustomListComponent,
  ],
  imports: [
    CommonModule,
    ClassesRoutingModule,
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
    FullNamePipeModule
  ],
  providers: [
    FullNamePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ClassesModule { }
