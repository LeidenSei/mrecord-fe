import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.buildBreadcrumbs(this.activatedRoute.root))
      )
      .subscribe(breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      });

    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
  }

  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({
        label: 'Home',
        url: 'common', // Bỏ dấu "/" ở đây
        active: false,
        icon: 'home'
      });
    }

    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        // Sửa logic này
        url = url ? `${url}/${routeURL}` : routeURL;
      }

      const breadcrumbLabel = child.snapshot.data['breadcrumb'];
      const breadcrumbIcon = child.snapshot.data['breadcrumbIcon'];
      
      if (breadcrumbLabel) {
        const existingBreadcrumb = breadcrumbs.find(b => b.url === url);
        if (!existingBreadcrumb) {
          breadcrumbs.push({
            label: breadcrumbLabel,
            url: url,
            active: false,
            icon: breadcrumbIcon
          });
        }
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].active = true;
    }

    return breadcrumbs;
  }

  onBreadcrumbClick(item: BreadcrumbItem): void {
    if (!item.active && item.url) {
      this.router.navigate([item.url]);
    }
  }
}