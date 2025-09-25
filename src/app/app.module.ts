import {APP_INITIALIZER, NgModule, Renderer2} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SideNavOuterToolbarModule, SingleCardModule } from './layouts';
import {
  AppFooterModule,
  ResetPasswordFormModule,
  CreateAccountFormModule,
  ChangePasswordFormModule,
  LoginFormModule, FormPopupModule,
} from './components';

import {AuthService, ScreenService, AppInfoService, DataService} from './services';
import { UnauthenticatedContentModule } from './layouts/unauthenticated-content/unauthenticated-content';
import { AppRoutingModule } from './app-routing.module';
import { CrmContactListModule } from './pages/crm-contact-list/crm-contact-list.component';
import { CrmContactDetailsModule } from './pages/crm-contact-details/crm-contact-details.component';
import { PlanningTaskListModule } from './pages/planning-task-list/planning-task-list.component';
import { PlanningTaskDetailsModule } from './pages/planning-task-details/planning-task-details.component';
import { AnalyticsDashboardModule } from './pages/analytics-dashboard/analytics-dashboard.component';
import { AnalyticsSalesReportModule } from './pages/analytics-sales-report/analytics-sales-report.component';
import { AnalyticsGeographyModule } from './pages/analytics-geography/analytics-geography.component';
import { ThemeService } from './services';
import {AppConfigService} from "./app-config.service";
import {NotificationService} from "./services/notification.service";
import {
  DxButtonModule,
  DxDataGridModule,
  DxDropDownButtonModule,
  DxPopupModule,
  DxSelectBoxModule, DxTemplateModule
} from "devextreme-angular";
import { SgdSsoComponent } from './components/sgd-sso/sgd-sso.component';
import { CkeditorComponent } from './custom-pages/controls/ckeditor/ckeditor.component';
import { LazyLoadDirective } from './shared/directive/lazy-load.directive';
import {ScreenSizeService} from "./services/screen-service.service";
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import {
  DxiColumnModule,
  DxiItemModule,
  DxoColumnChooserModule,
  DxoExportModule,
  DxoHeaderFilterModule, DxoLoadPanelModule, DxoScrollingModule, DxoSelectionModule, DxoSortingModule, DxoToolbarModule
} from "devextreme-angular/ui/nested";
import {FullNamePipeModule} from "./pipes/full-name.pipe";
import {NgxDocViewerModule} from "ngx-doc-viewer";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
export function configServiceFactory(config: AppConfigService) {
  return () => config.load();
}
@NgModule({
  declarations: [
    AppComponent,
    SgdSsoComponent,
    LazyLoadDirective,
  ],
  imports: [
    BrowserModule,
    SideNavOuterToolbarModule,
    SingleCardModule,
    AppFooterModule,
    ResetPasswordFormModule,
    CreateAccountFormModule,
    ChangePasswordFormModule,
    LoginFormModule,
    UnauthenticatedContentModule,

    CrmContactListModule,
    CrmContactDetailsModule,
    PlanningTaskListModule,
    PlanningTaskDetailsModule,
    AnalyticsDashboardModule,
    AnalyticsSalesReportModule,
    AnalyticsGeographyModule,
    AppRoutingModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxPopupModule,
    DxTemplateModule,
    DxiColumnModule,
    DxiItemModule,
    DxoColumnChooserModule,
    DxoExportModule,
    DxoHeaderFilterModule,
    DxoLoadPanelModule,
    DxoScrollingModule,
    DxoSelectionModule,
    DxoSortingModule,
    DxoToolbarModule,
    FullNamePipeModule,
    NgxDocViewerModule,
  ],
  providers: [
    AuthService,
    ScreenService,
    AppInfoService,
    ThemeService,
    NotificationService,
    DataService,
    ScreenSizeService,
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configServiceFactory,
      deps: [AppConfigService],
      multi: true
    },
    /*{ provide: LocationStrategy, useClass: HashLocationStrategy }*/
  ],
  bootstrap: [AppComponent],
  exports: [
  ]
})
export class AppModule {
  constructor() {
    this.overrideNewDate();
  }

  overrideNewDate() {
  }
}
