import {Component, OnInit, ViewChild} from '@angular/core';
import {MathjaxComponent} from "../../../components/utils/mathjax/mathjax.component";
import {DataService} from "../../../services";
import {DomSanitizer} from "@angular/platform-browser";
import {AppConfigService} from "../../../app-config.service";
import {Constant} from "../../../shared/constants/constant.class";

@Component({
  selector: 'app-student-lesson-mark',
  templateUrl: './student-lesson-mark.component.html',
  styleUrls: ['./student-lesson-mark.component.scss']
})
export class StudentLessonMarkComponent implements OnInit {
  uploadHeaders: any;
  isShowEdit = false;
  loadingEditor = false;
  editorConfig: any;
  uploadUrl = this.configService.getConfig().api.baseUrl + '/api/ExamPaper/ReadExamPaper';
  @ViewChild(MathjaxComponent) childView: MathjaxComponent;
  trustedHtml: any;
  txt = '<div><span class="math-inline ">' +
    '<mathml style="display: block"><math xmlns="http://www.w3.org/1998/Math/MathML">\n' +
    '  <mo stretchy="false">(</mo>\n' +
    '  <mi>P</mi>\n' +
    '  <mo stretchy="false">)</mo>\n' +
    '  <mo>:</mo>\n' +
    '  <mn>2</mn>\n' +
    '  <mi>x</mi>\n' +
    '  <mo>&#x2212;</mo>\n' +
    '  <mi>y</mi>\n' +
    '  <mo>+</mo>\n' +
    '  <mn>3</mn>\n' +
    '  <mi>z</mi>\n' +
    '  <mo>+</mo>\n' +
    '  <mn>1</mn>\n' +
    '  <mo>=</mo>\n' +
    '  <mn>0</mn>\n' +
    '</math></mathml><latex style="display: none">(P): 2 x-y+3 z+1=0</latex></span></div>\n';
  rawData2 = {
    list: []
  };
  name = 'Mathjax ';
  mathContent = `
 
 Trong không gian \\(Oxyz\\), cho điểm \\(M(1; - 2;3)\\) và  mặt phẳng \\((P):2x - y + 3z + 1 = 0\\). Phương trình của đường thẳng đi  qua \\(M\\) và vuông góc với \\((P)\\) là 
 
  `
  source = [];
  source2 = [];
  public model = {
    editorData: '<strong>ABC</strong>'
  };

  constructor(private service: DataService, private sanitizer: DomSanitizer, private configService: AppConfigService) {
    this.trustedHtml = this.sanitizer
      .bypassSecurityTrustHtml(this.txt);
    this.uploadHeaders = {
      Authorization: 'Bearer ' + localStorage.getItem(Constant.TOKEN)
    };

  }

  async ngOnInit() {
    CKEDITOR.plugins.addExternal('ckeditor_wiris', 'https://h5p.mschool.edu.vn/h5p/editor/ckeditor/plugins/ckeditor_wiris/', 'plugin.js');
    this.editorConfig = {
      extraPlugins: 'ckeditor_wiris',
      allowedContent: true,
      toolbar: [
        { name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print'] },
        { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'Undo', 'Redo'] },
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
        { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar'] },
        { name: 'wiris', items: ['ckeditor_wiris_formulaEditor', 'ckeditor_wiris_formulaEditorChemistry'] }
      ]
    };

    let temp = localStorage.getItem('exam-paper-temp');
    if (temp) {
      this.rawData2 = JSON.parse(temp);
      this.parseQuestion();
    }
  }

  /*handle upload*/
  onUploadStarted(e: any) {

  }

  onFileUploaded(e: any) {
    const response = e.request.response;
    if (response) {
      let res = JSON.parse(response);
      console.log(res);
      localStorage.setItem('exam-paper-temp', JSON.stringify(res));
      this.rawData2 = res;
      this.parseQuestion();
    }
  }

  parseQuestion() {
    this.source2 = [];
    let i = 1;
    this.rawData2.list.forEach(en => {
      const item = {
        stt: i,
        question: this.sanitizer.bypassSecurityTrustHtml(en.text),
        answers: this.toAnswer(en.answers)
      };
      this.source2.push(item);
      i++;
    });

    setTimeout(() => {
      this.childView ? this.childView.renderMath() : void (0);
    }, 0);
    console.log(this.source2);
  }

  onUploadError(e: any) {
    console.error('Upload error:', e);
    // Thực hiện các hành động tùy chỉnh khi upload gặp lỗi
  }


  toAnswer(answers) {
    answers.forEach(en => {
      en.text = this.sanitizer.bypassSecurityTrustHtml(en.text)
    });
    return answers;
  }


  editQuestion(item: any) {
    this.loadingEditor = true;
    const htmlString: string = (item.question as any)['changingThisBreaksApplicationSecurity'];
    console.log(htmlString);
    this.model.editorData = htmlString;
  }

  onContentReady($event) {
    this.loadingEditor = false;
    console.log(this.loadingEditor);
  }
}
