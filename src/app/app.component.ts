import {Component, HostBinding, OnDestroy, OnInit,} from '@angular/core';
import { AppInfoService, AuthService, ScreenService, ThemeService } from './services';
import {Constant} from "./shared/constants/constant.class";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter((cl) => this.screen.sizes[cl]).join(' ');
  }

  constructor(private authService: AuthService,
              private themeService: ThemeService,
              private screen: ScreenService,
              private route: Router,
              public appInfo: AppInfoService) {
    themeService.setAppTheme();
  }

  isAuthenticated() {
    return this.authService.loggedIn;
  }

  ngOnDestroy(): void {
    this.screen.breakpointSubscription.unsubscribe();
  }

  ngOnInit(): void {

  }
}
