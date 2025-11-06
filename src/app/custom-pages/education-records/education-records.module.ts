import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolRecordsComponent } from './school-records/school-records.component';
import { SubjectGroupRecordsComponent } from './subject-group-records/subject-group-records.component';
import { EducationRecordsRoutingModule } from './education-records-routing.module';
import { 
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxTextAreaModule,
  DxFileUploaderModule,
  DxCheckBoxModule,
  DxLoadPanelModule,
  DxTagBoxModule,
  DxNumberBoxModule,
  DxDateBoxModule,
  DxValidatorModule,
  DxValidationSummaryModule,
  DxValidationGroupModule,
  DxScrollViewModule,
  DxToolbarModule,
  DxTabPanelModule
} from 'devextreme-angular';
import { ToChuyenMonService } from 'src/app/services/to-chuyen-mon.service';
import { HoSoGiaoDucService } from 'src/app/services/ho-so-giao-duc.service';

@NgModule({
  declarations: [
    SchoolRecordsComponent,
    SubjectGroupRecordsComponent
  ],
  imports: [
    CommonModule,
    EducationRecordsRoutingModule,
    DxDataGridModule,
    DxFormModule,
    DxPopupModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxLoadPanelModule,
    DxTagBoxModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxValidatorModule,
    DxValidationSummaryModule,
    DxValidationGroupModule,
    DxScrollViewModule,
    DxToolbarModule,
    DxTabPanelModule
  ],
  providers: [
    ToChuyenMonService,
    HoSoGiaoDucService
  ]
})
export class EducationRecordsModule { }