import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { MathfieldElement, Mathfield } from 'mathlive';
@Component({
  selector: 'app-digi-exam',
  templateUrl: './digi-exam.component.html',
  styleUrls: ['./digi-exam.component.scss']
})
export class DigiExamComponent implements AfterViewInit {
  @ViewChild('mathfield', { static: true }) mathfieldRef!: ElementRef<MathfieldElement>;

  //public Editor = ClassicEditor;
  public model = {
    editorData: '$1+2$'
  };

  public config = {
    toolbar: [
      'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote',
      '|', 'MathType', 'Chemistry', '|', 'undo', 'redo'
    ]
  };

  ngOnInit(): void {

  }
  getTextEditor() {
    console.log(this.model.editorData);
  }
  /*getLatex(): void {
    const mathfieldElement = this.mathfieldRef.nativeElement.querySelector('math-field') as MathfieldElement;
    if (mathfieldElement) {
      const latex = mathfieldElement.value;
      console.log('Latex:', latex);
    }
  }*/

  /*ngAfterViewInit(): void {
    const mathfieldElement = new MathfieldElement();

    // Gắn mathfieldElement vào DOM
    this.mathfieldRef.nativeElement.appendChild(mathfieldElement);

    // Thiết lập các thuộc tính trực tiếp
    mathfieldElement.smartMode = true;
    mathfieldElement.mathVirtualKeyboardPolicy = "manual";

    // Đặt giá trị ban đầu
    mathfieldElement.value = '$$\\frac{1}{\\sqrt{2}}$$';
  }*/

  ngAfterViewInit() {
    console.log((window as any).MathType);
    return;
    (window as any).ClassicEditor
      .create(document.querySelector('#editor'), {
        plugins: [ (window as any).MathType, ...(window as any).ClassicEditor.builtinPlugins ],
        toolbar: [
          'mathType', 'chemType', '|', 'heading', '|',
          'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
          'insertTable', 'blockQuote', 'undo', 'redo'
        ]
      })
      .then(editor => {
        console.log('Editor was initialized', editor);
      })
      .catch(error => {
        console.error(error.stack);
      });
  }
}
