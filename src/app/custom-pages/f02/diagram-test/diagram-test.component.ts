import {
  NgModule, Component, ViewChild, enableProdMode, ChangeDetectorRef, OnInit,
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {HttpClient, HttpClientModule} from '@angular/common/http';

import {DxDiagramModule, DxDiagramComponent} from 'devextreme-angular';
import {confirm} from 'devextreme/ui/dialog';
import {AuthService, DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  selector: 'app-diagram-test',
  templateUrl: './diagram-test.component.html',
  styleUrls: ['./diagram-test.component.scss'],
  preserveWhitespaces: true,
})
export class DiagramTestComponent implements OnInit{
  contentList: any[];
  h5pFrame: any;
  h5pUrl = this.configService.getConfig().api.h5pUrl;
  @ViewChild(DxDiagramComponent, {static: false}) diagram: DxDiagramComponent;

  ngAfterViewInit() {
    // Listening for messages from React iframe
    this.h5pFrame = document.getElementById('reactFrame');
    this.h5pFrame.setAttribute("src", this.h5pUrl);
    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }
  async ngOnInit() {

  }
  callChildFunction() {
    if (this.h5pFrame) {
      this.h5pFrame.contentWindow.postMessage('Hello from Angular!', '*');
    }
  }
  setH5PContentId(contentId){
    if (this.h5pFrame) {
      this.h5pFrame.contentWindow.postMessage({type: 'setContentId', contentId}, '*');
    }
  }
  receiveMessage(event: any) {
    if (event.origin !== this.h5pUrl) {
      return;
    }
    //console.log('Message from React:', event.data);
    if (event.data.type === 'callParentFunction' && event.data.payload) {
      this.callParentFunction(event.data.payload);
    }
  }
  callParentFunction(payload) {
    console.log('Parent function called from child', payload);
    if (payload.loaded){
      this.login();
    }
  }

  constructor(private service: DataService,
              public screen: ScreenService,
              public generalService: GeneralService,
              public authService: AuthService,
              private route: ActivatedRoute,
              private configService: AppConfigService,
              private notificationService: NotificationService,
              private router: Router,
              private ref: ChangeDetectorRef) {
    let data = {"page":{"width":11906,"height":8391,"pageColor":-1,"pageWidth":8391,"pageHeight":11906,"pageLandscape":true},"connectors":[],"shapes":[{"key":"136","locked":false,"zIndex":0,"type":"text","text":"Ticket Processing Flow","x":2160,"y":4500,"width":7740,"height":360,"styleText":{"font-size":"14pt","font-weight":"bold"}}]};
    let str = "{\"page\":{\"width\":11906,\"height\":8391,\"pageColor\":-1,\"pageWidth\":8391,\"pageHeight\":11906,\"pageLandscape\":true},\"connectors\":[],\"shapes\":[{\"key\":\"136\",\"locked\":false,\"zIndex\":0,\"type\":\"text\",\"text\":\"Ticket Processing Flow\",\"x\":2160,\"y\":4500,\"width\":7740,\"height\":360,\"styleText\":{\"font-size\":\"14pt\",\"font-weight\":\"bold\"}},{\"key\":\"137\",\"locked\":false,\"zIndex\":0,\"type\":\"internet\",\"text\":\"\",\"x\":4140,\"y\":2880,\"width\":5040,\"height\":3420}]}";
    str = "{\"page\":{\"width\":11906,\"height\":8391,\"pageColor\":-1,\"pageWidth\":8391,\"pageHeight\":11906,\"pageLandscape\":true},\"connectors\":[],\"shapes\":[{\"key\":\"136\",\"locked\":false,\"zIndex\":0,\"type\":\"text\",\"text\":\"Ticket Processing Flow\",\"x\":2160,\"y\":4500,\"width\":7740,\"height\":360,\"styleText\":{\"font-size\":\"14pt\",\"font-weight\":\"bold\"}},{\"key\":\"137\",\"locked\":false,\"zIndex\":0,\"type\":\"internet\",\"text\":\"\",\"x\":0,\"y\":0,\"width\":11880,\"height\":8280}]}";
    setTimeout(() => {
      //this.diagram.instance.import(str);
    }, 1000);

  }

  exportToJson() {
    console.log(this.diagram.instance.export());
  }

  onCustomCommand(e) {
    if (e.name === 'clear') {
      const result = confirm('Are you sure you want to clear the diagram? This action cannot be undone.', 'Warning');
      result.then(
        (dialogResult) => {
          if (dialogResult) {
            e.component.import('');
          }
        },
      );
    }
  }


  editContent() {
    this.setH5PContentId('1070083457');
  }

  editContent2() {
    this.setH5PContentId('1242121994');
  }
  createBaiGiang() {
    this.setH5PContentId('new');
  }

  playContent() {
    const contentId = prompt('id bài giảng', '1090022328');
    this.h5pFrame.contentWindow.postMessage({
      type: 'playContentId', contentId,
    }, '*');
  }

  async login() {
    const user = await this.authService.getUser();
    this.h5pFrame.contentWindow.postMessage({
      type: 'doLogin', userId: user.data.id,
    }, '*');
    console.log(user.data);
  }
}
