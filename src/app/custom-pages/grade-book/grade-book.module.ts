import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxFormModule, DxButtonModule, DxSelectBoxModule, DxTextBoxModule, DxDateBoxModule, DxLoadPanelModule, DxPopupModule, DxScrollViewModule, DxValidatorModule, DxValidationGroupModule, DxTextAreaModule, DxHtmlEditorModule, DxToolbarModule, DxDropDownButtonModule } from 'devextreme-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SubjectBookComponent } from './personal/subject-book/subject-book.component';
import { GradeBookRoutingModule } from './grade-book-routing.module';
import { ClassBookComponent } from './class/class-book/class-book.component';

@NgModule({
  declarations: [
    SubjectBookComponent,
    ClassBookComponent,
  ],
  imports: [
    CommonModule,
    GradeBookRoutingModule,
    DxDataGridModule,
    DxFormModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxLoadPanelModule,
    DxPopupModule,
    DxScrollViewModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxTextAreaModule,
    ReactiveFormsModule,
    DxHtmlEditorModule,
    FormsModule ,
    DxToolbarModule,
    DxDropDownButtonModule
  ]
})
export class GradeBookModule { }