import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DxValidationGroupComponent } from 'devextreme-angular';
import { AuthService, DataService, ScreenService } from '../../../services';
import { GeneralService } from '../../../services/general.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AppConfigService } from '../../../app-config.service';
import { Constant } from '../../../shared/constants/constant.class';
import { confirm } from 'devextreme/ui/dialog';
import { forkJoin } from 'rxjs';
import { ExportingEvent } from 'devextreme/ui/data_grid';
import { Workbook } from 'exceljs';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver-es';
import { ClassService } from 'src/app/services/class.service';

@Component({
  selector: 'app-subject-teacher-list-c2',
  templateUrl: './subject-teacher-list-c2.component.html',
  styleUrls: ['./subject-teacher-list-c2.component.scss']
})
export class SubjectTeacherListC2Component implements OnInit {
  datas = [];
  teacherCount: 0;
  
  // Filter sources
  classSource = [];
  filterClassSource = [];
  gradeSource = [];
  semesterSource = [
    { id: null, name: 'Cả năm' },
    { id: 1, name: 'Học kỳ I' },
    { id: 2, name: 'Học kỳ II' }
  ];
  
  // Selected filters
  filterGrade: any = 0;
  filterClassId: any;
  selectedSemesterId: any = null;
  
  // User info
  isAdmin = false;
  isBGH = false;
  
  // Export configuration
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel',
    exportSelectedRows: 'Xuất các dòng đã chọn',
    exportTo: 'Xuất dữ liệu',
  };

  @ViewChild('validationGroup', { static: true }) validationGroup: DxValidationGroupComponent;

  constructor(
    private service: DataService,
    public screen: ScreenService,
    public generalService: GeneralService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private configService: AppConfigService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private classService: ClassService,
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.isAdmin = user.data.role === 2;
    this.isBGH = user.data.isBGH || false;

    forkJoin([
      this.generalService.getListGradeOfSchool(user.data.schoolId),
      this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
      this.generalService.getListClassBySchool(user.data.schoolId),
    ]).subscribe(([gradeSource, classSource, schoolClassSource]) => {
      this.classSource = (this.isAdmin || this.isBGH) ? schoolClassSource : classSource;
      let filterGradeIds = classSource.map(en => en.grade);
      
      if (this.isAdmin || this.isBGH) {
        this.gradeSource = gradeSource.filter(en => 1 === 1);
      } else {
        this.gradeSource = gradeSource.filter(en => filterGradeIds.includes(en));
      }
      
      this.filterGrade = this.gradeSource[0];
      
      if (this.filterGrade) {
        this.filterClassSource = this.classSource.filter(en => en.grade === this.filterGrade);
      } else {
        this.filterClassSource = this.classSource.filter(en => 1 === 1);
      }
      
      if (this.filterClassSource.length > 0) {
        this.filterClassId = this.filterClassSource[0].id;
        this.loadGrid();
      }
    });
  }

  async loadGrid() {
    if (!this.filterClassId) {
      this.datas = [];
      this.teacherCount = 0;
      return;
    }

    // ✅ SỬA: Dùng getTeacherSubjectList thay vì getTeacherSubjectListByClass
    this.classService.getTeacherSubjectList(
      this.filterClassId,
      this.selectedSemesterId
    ).subscribe(
      res => {
        this.datas = res;
        let index = 1;
        this.teacherCount = res.length;
        
        this.datas.forEach(en => {
          en.stt = index++;
          en.signedStatusText = this.getSignedStatus(en);
          en.signedByText = this.getSignedBy(en);
          en.signedDateFormatted = en.signedDate ? 
            new Date(en.signedDate).toLocaleDateString('vi-VN') : '';
        });
        
        this.ref.detectChanges();
      },
      error => {
        console.error('Error loading teacher subject data:', error);
        this.notificationService.showNotification(
          Constant.ERROR, 
          'Không thể tải danh sách giáo viên bộ môn'
        );
        this.datas = [];
        this.teacherCount = 0;
      }
    );
  }

  gradeChange($event: any) {
    if (!Number.isNaN($event.itemData)) {
      this.filterClassSource = this.classSource.filter(en => en.grade === +$event.itemData);
    } else {
      this.filterClassSource = this.classSource.filter(en => 1 === 1);
    }
    
    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
      this.loadGrid();
    }
  }

  classChange($event) {
    this.filterClassId = $event.itemData.id;
    this.loadGrid();
  }

  semesterChange($event: any) {
    this.selectedSemesterId = $event.itemData.id;
    this.loadGrid();
  }

  getSignedStatus(data: any): string {
    if (data.signed) {
      return 'Đã ký';
    }
    return 'Chưa ký';
  }

  getSignedBy(data: any): string {
    if (data.replaceByPrincipal) {
      return 'Hiệu trưởng thay';
    }
    if (data.signedFor) {
      return `${data.signedFor.userFullName} (${this.getRoleName(data.signedFor.role)})`;
    }
    return '';
  }

  getRoleName(role: number): string {
    const roles: { [key: number]: string } = {
      1: 'Giáo viên',
      2: 'Hiệu trưởng',
      3: 'Phó hiệu trưởng',
      4: 'Tổ trưởng',
      5: 'Quản trị'
    };
    return roles[role] || '';
  }

  onExporting(e: ExportingEvent) {
    let cls = this.classSource.find(en => en.id === this.filterClassId);
    let clsName = cls ? cls.name.toUpperCase() : 'ALL';
    let semesterText = this.selectedSemesterId ? 
      `_HK${this.selectedSemesterId}` : '_CANAM';
    
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('GiaoVienBoMon');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'data') {
          // Format date columns
          if (gridCell.column.dataField === 'signedDate' && gridCell.value) {
            excelCell.value = new Date(gridCell.value);
            excelCell.numFmt = 'dd/mm/yyyy';
          }
        }
      }
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }), 
          `DS_GIAOVIEN_BOMON_${clsName}${semesterText}.xlsx`
        );
      });
    });
    e.cancel = true;
  }

  // Optional: Method to handle row click if needed
  onRowClick(e: any) {
    // Navigate to detail page or show popup
    // this.router.navigate(['/teacher-detail', e.data.teacherId]);
  }
}