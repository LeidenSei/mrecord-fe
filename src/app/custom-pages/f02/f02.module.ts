import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {F02RoutingModule} from "./f02-routing.module";
import { CarInsuranceComponent } from './car-insurance/car-insurance.component';
import {
  DxAutocompleteModule,
  DxButtonModule, DxCalendarModule, DxCheckBoxModule,
  DxDataGridModule, DxDateBoxModule, DxDiagramModule,
  DxDropDownButtonModule, DxFormModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxScrollViewModule,
  DxSelectBoxModule, DxSwitchModule, DxTextAreaModule,
  DxTextBoxModule, DxToolbarModule, DxValidationGroupModule, DxValidatorModule
} from "devextreme-angular";
import {ContactPanelModule} from "../../components/library/contact-panel/contact-panel.component";
import {ContactNewFormModule} from "../../components/library/contact-new-form/contact-new-form.component";
import {
  CardActivitiesModule,
  ContactStatusModule,
  FormPhotoUploaderModule,
  FormPopupModule,
  FormTextboxModule
} from "../../components";
import { CarInsuranceEditComponent } from './car-insurance-edit/car-insurance-edit.component';
import { CarCustomerComponent } from './car-customer/car-customer.component';
import {ItemLabelTopModule} from "../../shared/utils/label-top/label-top.component";
import { DiagramTestComponent } from './diagram-test/diagram-test.component';
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import { CloseComponent } from './close/close.component';



@NgModule({
  declarations: [
    CarInsuranceComponent,
    CarInsuranceEditComponent,
    CarCustomerComponent,
    DiagramTestComponent,
    CloseComponent
  ],
  imports: [
    CommonModule,
    F02RoutingModule,
    FormsModule,
    DxFormModule,
    ReactiveFormsModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxNumberBoxModule,
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
    DxValidationGroupModule,
    DxSwitchModule,
    DxPopupModule,
    DxCalendarModule,
    DxDateBoxModule,
    ItemLabelTopModule,
    DxCheckBoxModule,
    DxAutocompleteModule,
    DxDiagramModule,
    DxTextAreaModule
  ]
})
export class F02Module { }
