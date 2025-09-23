import {NgModule, Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string, officeViewer = false): SafeResourceUrl {
    if (officeViewer){
      let retUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${url}`
      return this.sanitizer.bypassSecurityTrustResourceUrl(retUrl);
    } else {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}
@NgModule({
  imports: [],
  providers: [],
  exports: [SafePipe],
  declarations: [SafePipe],
})
export class SafePipeModule { }
