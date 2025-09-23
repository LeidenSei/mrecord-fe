import { Injectable } from '@angular/core';
import {
  CanLoad,
  CanActivate,
  Router,
  Route,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import {Constant} from '../constants/constant.class';

@Injectable()
export class AuthGuard implements CanLoad, CanActivate {
  constructor(private router: Router) {}

  canLoad(route: Route): boolean {
    if (this.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login-form']);
    return false;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // check authentication
    return this.isLoggedIn(state.url);
  }

  isLoggedIn(url?: string): boolean {
    const currentUser = localStorage.getItem(Constant.TOKEN);
    if (currentUser && currentUser !== Constant.TOKEN) {
      return true;
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: url }});
    return false;
  }
}
