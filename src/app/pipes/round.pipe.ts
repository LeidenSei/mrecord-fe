import {NgModule, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'round'
})
export class RoundPipe implements PipeTransform {

  transform(value: number, decimalPlaces: number = 2): number {
    if (!value) {
      return 0;
    }
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
  }

}
@NgModule({
  imports: [],
  providers: [],
  exports: [RoundPipe],
  declarations: [RoundPipe],
})
export class RoundPipeModule { }
