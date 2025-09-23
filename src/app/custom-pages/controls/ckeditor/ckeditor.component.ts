import {Component, AfterViewInit, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'app-ckeditor',
  templateUrl: './ckeditor.component.html',
  styleUrls: ['./ckeditor.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CkeditorComponent),
      multi: true
    }
  ]
})
export class CkeditorComponent implements AfterViewInit, ControlValueAccessor {
  private editorInstance: any;
  @Input() editorId: string = '';
  @Output() ready = new EventEmitter<void>();
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private value: string = '';
  public loading: boolean = true;
  private static scriptLoadPromise: Promise<void> | null = null;
  ngAfterViewInit() {
    if (!CkeditorComponent.scriptLoadPromise) {
      // Nếu script chưa được nạp, tạo một Promise mới
      CkeditorComponent.scriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/assets/js/ckeditor.js';
        script.onload = () => {
          resolve();
        };
        script.onerror = (error) => {
          reject(error);
        };
        document.body.appendChild(script);
      });
    }

    // Sử dụng Promise để khởi tạo editor sau khi script đã được nạp
    CkeditorComponent.scriptLoadPromise
      .then(() => {
        this.initializeEditor();
      })
      .catch(error => {
        console.error('Failed to load CKEditor script:', error);
      });
  }

  private initializeEditor() {
    console.log((window as any).ClassicEditor, (window as any).MathType)
    if ((window as any).ClassicEditor.instances && (window as any).ClassicEditor.instances[this.editorId]) {
      return;
    }

    (window as any).ClassicEditor
      .create(document.querySelector(`#${this.editorId}`), {
        /*toolbar: ['ImageInsert', 'ImageUpload', 'ChemType', 'MathType']*/
      }) // Khởi tạo đúng editor theo ID
      .then((editor: any) => {
        this.editorInstance = editor;
        this.editorInstance.setData(this.value);

        this.editorInstance.model.document.on('change:data', () => {
          const data = this.editorInstance.getData();
          this.onChange(data);
          this.value = data;
        });
        this.loading = false; // Ngừng trạng thái loading
        this.ready.emit();
      })
      .catch((error: any) => {
        console.error('There was a problem initializing the editor.', error);
      });
  }
  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.loading = false;
    this.value = value || '';
    if (this.editorInstance) {
      this.editorInstance.setData(this.value);
      this.ready.emit();
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editorInstance) {
      this.editorInstance.isReadOnly = isDisabled;
    }
  }
}
