import {NgModule, Pipe, PipeTransform} from '@angular/core';
import {PhonePipe} from "./phone.pipe";

@Pipe({
  name: 'fullName'
})
export class FullNamePipe implements PipeTransform {

  transform(item: { firstName?: string; middleName?: string; lastName?: string }): string {
    if (!item) return '';

    const { firstName = '', middleName = '', lastName = '' } = item;

    const fullName = [firstName, middleName, lastName]
      .filter(name => name && name.trim()) // Lọc ra các giá trị hợp lệ (không null, undefined, rỗng)
      .join(' '); // Ghép chúng lại bằng dấu cách

    return fullName || ''; // Trả về chuỗi rỗng nếu fullName không có giá trị
  }
}
@NgModule({
  imports: [],
  providers: [],
  exports: [FullNamePipe],
  declarations: [FullNamePipe],
})
export class FullNamePipeModule { }
