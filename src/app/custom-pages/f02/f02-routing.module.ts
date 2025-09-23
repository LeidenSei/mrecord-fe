import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CarInsuranceComponent} from "./car-insurance/car-insurance.component";
import {CarInsuranceEditComponent} from "./car-insurance-edit/car-insurance-edit.component";
import {DiagramTestComponent} from "./diagram-test/diagram-test.component";
import {CarCustomerComponent} from "./car-customer/car-customer.component";
import {CloseComponent} from "./close/close.component";

@NgModule({
  imports: [RouterModule.forChild([
    {path: '', component: CarInsuranceComponent},
    {path: 'mv', component: CarInsuranceComponent},
    {path: 'add', component: CarInsuranceEditComponent},
    {path: 'edit/:id', component: CarInsuranceEditComponent},
    {path: 'diagram', component: DiagramTestComponent},
    {path: 'kh', component: CarCustomerComponent},
    {path: 'close', component: CloseComponent},
  ])],
  exports: [RouterModule]
})

export class F02RoutingModule {}
