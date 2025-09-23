import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { H5PPlayerComponent } from './h5p-player/h5p-player.component';  // Component của bạn

@NgModule({
  declarations: [
    H5PPlayerComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    H5PPlayerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Thêm CUSTOM_ELEMENTS_SCHEMA để Angular hỗ trợ Web Components
})
export class H5PModule { }
