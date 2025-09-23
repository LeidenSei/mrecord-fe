import {Component, Input, NgModule} from '@angular/core';
import {DxButtonModule, DxTextBoxModule, DxValidatorModule} from "devextreme-angular";
import {CommonModule} from "@angular/common";
import {FormTextboxComponent} from "../../../components";

@Component({
  selector: 'item-label-top',
  templateUrl: './label-top.component.html',
  styleUrls: ['./label-top.component.scss']
})
export class LabelTopComponent {
  @Input() label: string;
  @Input() bold = false;
  @Input() required = false;
}
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LabelTopComponent],
  exports: [LabelTopComponent],
})
export class ItemLabelTopModule { }
