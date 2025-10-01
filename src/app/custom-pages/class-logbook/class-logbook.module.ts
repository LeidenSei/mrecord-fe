import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassLogbookRoutingModule } from './class-logbook-routing.module';

import { ClassCommitteeComponent } from './class-committee/class-committee.component';
import { ClassNotesComponent } from './class-notes/class-notes.component';
import { GoodDeedsComponent } from './good-deeds/good-deeds.component';
import { ParentCommitteeComponent } from './parent-committee/parent-committee.component';
import { HomeroomPlanComponent } from './homeroom-plan/homeroom-plan.component';
import { MonthlyPlanComponent } from './monthly-plan/monthly-plan.component';
import { MidtermAssessmentComponent } from './midterm-assessment/midterm-assessment.component';
import { FinalAssessmentComponent } from './final-assessment/final-assessment.component';
import { Semester1CommentsComponent } from './semester1-comments/semester1-comments.component';
import { Semester2PlanSupplementComponent } from './semester2-plan-supplement/semester2-plan-supplement.component';

import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxCheckBoxModule, DxDropDownButtonModule, DxLookupModule, DxPopupModule, DxScrollViewModule, DxSplitterModule } from 'devextreme-angular';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { AgGridAngular } from 'ag-grid-angular';

@NgModule({
  declarations: [
    ClassCommitteeComponent,
    ClassNotesComponent,
    GoodDeedsComponent,
    ParentCommitteeComponent,
    HomeroomPlanComponent,
    MonthlyPlanComponent,
    MidtermAssessmentComponent,
    FinalAssessmentComponent,
    Semester1CommentsComponent,
    Semester2PlanSupplementComponent
  ],
 imports: [
    CommonModule,
    ClassLogbookRoutingModule,
    DxDataGridModule,
    DxFormModule,
    DxButtonModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxDropDownButtonModule,
    DxCheckBoxModule,
    DxLookupModule,
    FormsModule,
    DxSplitterModule,
    AngularSplitModule,
    DxPopupModule,
    DxScrollViewModule,
    AgGridAngular
  ]
})
export class ClassLogbookModule { }