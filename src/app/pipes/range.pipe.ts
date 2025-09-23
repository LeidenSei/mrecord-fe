import {NgModule, Pipe, PipeTransform} from '@angular/core';
import {PhonePipe} from "./phone.pipe";

@Pipe({ name: 'range' })
export class RangePipe implements PipeTransform {
  transform(value: number): number[] {
    return Array.from({ length: value }, (_, i) => i + 1);
  }
}
@NgModule({
  imports: [],
  providers: [],
  exports: [RangePipe],
  declarations: [RangePipe],
})
export class RangePipeModule { }
