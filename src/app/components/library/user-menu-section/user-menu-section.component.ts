import {Component, NgModule, Input, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxListModule, DxListTypes } from 'devextreme-angular/ui/list';
import {AuthService, IUser} from '../../../services/auth.service';
import {DataService, ScreenService} from "../../../services";
import {GeneralService} from "../../../services/general.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";
import {AppConfigService} from "../../../app-config.service";
import {FullNamePipe} from "../../../pipes/full-name.pipe";
import {DxButtonModule, DxPopupModule} from "devextreme-angular";
import {NgxDocViewerModule} from "ngx-doc-viewer";
import {Constant} from "../../../shared/constants/constant.class";

@Component({
  selector: 'user-menu-section',
  templateUrl: 'user-menu-section.component.html',
  styleUrls: ['./user-menu-section.component.scss'],
})

export class UserMenuSectionComponent {
  @Input()
  menuItems: any;

  @Input()
  showAvatar!: boolean;

  @Input()
  user!: IUser | null;

  @ViewChild('userInfoList', { read: ElementRef }) userInfoList: ElementRef<HTMLElement>;

  constructor(
    public screen: ScreenService,
    public generalService: GeneralService,
    public authService: AuthService,
  ) {}

  handleListItemClick(e: DxListTypes.ItemClickEvent) {
    return;
    //TODO Tìm hiểu tại sao lại có e.itemData?.onClick
    e.itemData?.onClick();
  }
}

@NgModule({
  imports: [
    DxListModule,
    CommonModule,
    DxButtonModule,
    DxPopupModule,
    NgxDocViewerModule,
  ],
  declarations: [UserMenuSectionComponent],
  exports: [UserMenuSectionComponent],
})
export class UserMenuSectionModule { }
