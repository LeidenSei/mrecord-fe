import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {DxTreeViewComponent, DxTreeViewModule, DxTreeViewTypes} from 'devextreme-angular/ui/tree-view';
import * as events from 'devextreme/events';
import {
  navigationAdmin,
  navigationPGD,
  navigationStudent,
  navigationTeacher,
  navigationTeacherHomeroom
} from '../../../app-navigation';
import {AuthService} from "../../../services";
import {Router} from "@angular/router";
import {GeneralService} from "../../../services/general.service";
import {lastValueFrom} from 'rxjs';

@Component({
  selector: 'side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrls: ['./side-navigation-menu.component.scss'],
})
export class SideNavigationMenuComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(DxTreeViewComponent, {static: true})
  menu!: DxTreeViewComponent;

  @Output()
  selectedItemChanged = new EventEmitter<DxTreeViewTypes.ItemClickEvent>();

  @Output()
  openMenu = new EventEmitter<any>();
  userData: any;
  items: any[] = [];
  path: string;
  isElementary= false;
  grade: any = 'c2';
  
  constructor(private elementRef: ElementRef,
              public authService: AuthService, private router: Router,
              public generalService: GeneralService,
  ) {
    this.path = this.router.url;
  }

  private _selectedItem!: String;

  get selectedItem(): String {
    return this._selectedItem;
  }

  @Input()
  set selectedItem(value: String) {
    this._selectedItem = value;
    this.setSelectedItem();
  }

  private _compactMode = false;

  @Input()
  get compactMode() {
    return this._compactMode;
  }

  set compactMode(val) {
    this._compactMode = val;

    if (!this.menu.instance) {
      return;
    }

    if (val) {
      this.menu.instance.collapseAll();
    } else {
      this.menu.instance.expandItem(this._selectedItem);
    }
  }

  async ngOnInit(): Promise<void> {
    this.userData = await this.authService.getUser();
    let school = await lastValueFrom(this.generalService.getSchool(this.userData.data.schoolId));
    this.isElementary = school.type === 1;
    this.grade = this.isElementary ? 'c1' : 'c2';
    
    if (this.userData.data.role === 2) {
      this.items = navigationAdmin.map((item: any) => {
        if (item.path && !(/^\//.test(item.path))) {
          item.path = `/${item.path}`;
        }
        
        let isSelected = false;
        let hasSelectedChild = false;
        
        if (this.path.includes(item.path) && item.path !== '') {
          item.selected = true;
          isSelected = true;
        }
        
        if (item.items?.length > 0){
          let childItem = item.items.find((en: any) => this.path.includes(en.path));
          if (childItem) {
            childItem.selected = true;
            hasSelectedChild = true;
          }
        }
        
        // Chỉ expand nếu item được chọn hoặc có child được chọn
        return {
          ...item, 
          expanded: !this._compactMode && (isSelected || hasSelectedChild)
        };
      });
      this.items = this.items.filter(en => !en.grade || en.grade === this.grade);
      
    } else if (this.userData.data.isBGH) {
      this.items = navigationAdmin.map((item: any) => {
        if (item.path && !(/^\//.test(item.path))) {
          item.path = `/${item.path}`;
        }
        
        let isSelected = false;
        let hasSelectedChild = false;
        
        if (this.path.includes(item.path) && item.path !== '') {
          item.selected = true;
          isSelected = true;
        }
        
        if (item.items?.length > 0){
          let childItem = item.items.find((en: any) => this.path.includes(en.path));
          if (childItem) {
            childItem.selected = true;
            hasSelectedChild = true;
          }
        }
        
        return {
          ...item, 
          expanded: !this._compactMode && (isSelected || hasSelectedChild)
        };
      });

      if (this.userData.data.role !== 3) {
        this.items = this.items.filter(en => en.icon !== 'card');
      }
      
    } else if (this.userData.data.role === 3 && this.userData.data.isGVCN) {
      this.items = navigationTeacherHomeroom.map((item: any) => {
        if (item.path && !(/^\//.test(item.path))) {
          item.path = `/${item.path}`;
        }
        
        let isSelected = false;
        let hasSelectedChild = false;
        
        if (this.path.includes(item.path) && item.path !== '') {
          item.selected = true;
          isSelected = true;
        }
        
        if (item.items?.length > 0){
          let childItem = item.items.find((en: any) => this.path.includes(en.path));
          if (childItem) {
            childItem.selected = true;
            hasSelectedChild = true;
          }
        }
        
        if (item.text === 'Học bạ số' && this.isElementary) {
          item.items = item.items?.filter((en: any) => en.type !== 'gvbm_thcs');
        }
        
        return {
          ...item, 
          expanded: !this._compactMode && (isSelected || hasSelectedChild)
        };
      });
      this.items = this.items.filter(en => !en.grade || en.grade === this.grade);
      
    } else if (this.userData.data.role === 3) {
      this.items = navigationTeacher.map((item: any) => {
        if (item.path && !(/^\//.test(item.path))) {
          item.path = `/${item.path}`;
        }
        
        let isSelected = false;
        let hasSelectedChild = false;
        
        if (this.path.includes(item.path) && item.path !== '') {
          item.selected = true;
          isSelected = true;
        }
        
        if (item.items?.length > 0){
          let childItem = item.items.find((en: any) => this.path.includes(en.path));
          if (childItem) {
            childItem.selected = true;
            hasSelectedChild = true;
          }
        }
        
        return {
          ...item, 
          expanded: !this._compactMode && (isSelected || hasSelectedChild)
        };
      });
      this.items = this.items.filter(en => !en.grade || en.grade === this.grade);
      
    } else if (this.userData.data.role === 12) {
      this.items = navigationStudent.map((item: any) => {
        if (item.path && !(/^\//.test(item.path))) {
          item.path = `/${item.path}`;
        }
        
        let isSelected = false;
        let hasSelectedChild = false;
        
        if (this.path.includes(item.path) && item.path !== '') {
          item.selected = true;
          isSelected = true;
        }
        
        if (item.items?.length > 0){
          let childItem = item.items.find((en: any) => this.path.includes(en.path));
          if (childItem) {
            childItem.selected = true;
            hasSelectedChild = true;
          }
        }
        
        return {
          ...item, 
          expanded: !this._compactMode && (isSelected || hasSelectedChild)
        };
      });
    } else if (this.userData.data.role === 8) {
      this.items = navigationPGD.map((item: any) => {
        if (item.path && !(/^\//.test(item.path))) {
          item.path = `/${item.path}`;
        }
        
        let isSelected = false;
        let hasSelectedChild = false;
        
        if (this.path.includes(item.path) && item.path !== '') {
          item.selected = true;
          isSelected = true;
        }
        
        if (item.items?.length > 0){
          let childItem = item.items.find((en: any) => this.path.includes(en.path));
          if (childItem) {
            childItem.selected = true;
            hasSelectedChild = true;
          }
        }
        
        return {
          ...item, 
          expanded: !this._compactMode && (isSelected || hasSelectedChild)
        };
      });
    }
  }

  setSelectedItem() {
    if (!this.menu.instance) {
      return;
    }

    this.menu.instance.selectItem(this.selectedItem);
  }

  onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
    const item = event.itemData;

    if (event.event.ctrlKey || event.event.metaKey) {
      // Ctrl + Click (hoặc Command + Click trên Mac)
      window.open(item.path, '_blank');
    } else {
      // Click bình thường → dùng luồng cũ
      this.selectedItemChanged.emit(event);
    }
  }

  ngAfterViewInit() {
    this.setSelectedItem();
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);
    });
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }
}

@NgModule({
  imports: [DxTreeViewModule],
  declarations: [SideNavigationMenuComponent],
  exports: [SideNavigationMenuComponent],
})
export class SideNavigationMenuModule {
}