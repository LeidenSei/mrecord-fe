import {Component, OnInit, Input, OnChanges, NgModule} from '@angular/core';
import {SimpleChanges} from '@angular/core';
import {GeneralService} from '../../../services/general.service';
import {DxButtonModule, DxCheckBoxModule, DxListModule} from 'devextreme-angular';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {CalendarListComponent} from '../calendar-list/calendar-list.component';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

// const MathJax = Window['mathjax'];
@Component({
  selector: 'mathjax',
  inputs: ['content'],
  templateUrl: './mathjax.component.html',
  styleUrls: ['./mathjax.component.css']
})
export class MathjaxComponent implements OnChanges {
  @Input() content: string;

  constructor(public gs: GeneralService) {
  }

  mathJaxObject;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content']) {
      // console.log('content chnaged')
      this.renderMath()
    }
  }

  renderMath() {
    // console.log('render math')
// MathJax.Hub.Queue(['Typeset',MathJax.Hub]);

    this.mathJaxObject = this.gs.nativeGlobal()['MathJax'];
    //setInterval(()=>{},1)
    let angObj = this;
    setTimeout(() => {
      angObj.mathJaxObject.Hub.Queue(['Typeset', angObj.mathJaxObject.Hub], 'mathContent');

    }, 0)
  }

  loadMathConfig() {
    this.mathJaxObject = this.gs.nativeGlobal()['MathJax'];
    this.mathJaxObject.Hub.Config({
      showMathMenu: false,
      tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
      menuSettings: {zoom: 'Double-Click', zscale: '150%'},
      CommonHTML: {linebreaks: {automatic: true}},
      'HTML-CSS': {linebreaks: {automatic: true}},
      SVG: {linebreaks: {automatic: true}}
    });
  }

  ngOnInit() {

    this.loadMathConfig()
    this.renderMath();

  }

}
@NgModule({
  imports:  [ HttpClientModule, CommonModule ],
  providers: [GeneralService],
  exports: [MathjaxComponent],
  declarations: [MathjaxComponent],
})
export class MathjaxModule { }
