import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScoreEntryRoutingModule } from './score-entry-routing.module';
import { OnePeriodComponent } from './one-period/one-period.component';
import { SemesterComponent } from './semester/semester.component';

import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxBoxModule } from 'devextreme-angular';
import { AgGridAngular } from 'ag-grid-angular';

@NgModule({
  declarations: [
    OnePeriodComponent,
    SemesterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ScoreEntryRoutingModule,
    DxDataGridModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxFormModule,
    DxLoadPanelModule,
    DxPopupModule,
    DxTextAreaModule,
    DxBoxModule,
    AgGridAngular,
  ]
})
export class ScoreEntryModule { }