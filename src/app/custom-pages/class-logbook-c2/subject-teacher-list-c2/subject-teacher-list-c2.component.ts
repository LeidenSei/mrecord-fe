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

  // Filter sources
  classSource = [];
  filterClassSource = [];
  gradeSource = [];

  // Selected filters
  filterGrade: any = 0;
  filterClassId: any;

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
      return;
    }

    // Load data for both semesters
    forkJoin([
      this.classService.getTeacherSubjectList(this.filterClassId, 1), // Học kỳ I
      this.classService.getTeacherSubjectList(this.filterClassId, 2)  // Học kỳ II
    ]).subscribe(
      ([semester1Data, semester2Data]) => {
        // Transform data to create rows with semester info
        const transformedData = [];

        // Group data by subject to ensure we have both semesters
        const subjectMap = new Map();

        // Process semester 1 data
        semester1Data.forEach(item => {
          const key = item.subjectId || item.subjectName;
          if (!subjectMap.has(key)) {
            subjectMap.set(key, {
              subjectId: item.subjectId,
              subjectName: item.subjectName,
              semester1: null,
              semester2: null
            });
          }
          subjectMap.get(key).semester1 = item;
        });

        // Process semester 2 data
        semester2Data.forEach(item => {
          const key = item.subjectId || item.subjectName;
          if (!subjectMap.has(key)) {
            subjectMap.set(key, {
              subjectId: item.subjectId,
              subjectName: item.subjectName,
              semester1: null,
              semester2: null
            });
          }
          subjectMap.get(key).semester2 = item;
        });

        // Create rows for each subject with both semesters
        let stt = 1;
        subjectMap.forEach(subjectData => {
          // Row for Học kỳ I
          transformedData.push({
            stt: stt++,
            subjectName: subjectData.subjectName,
            semesterName: 'Học kỳ I',
            semester: 1,
            teacherName: subjectData.semester1?.teacherName || '',
            personalId: subjectData.semester1?.personalId || '',
            phoneNumber: subjectData.semester1?.phoneNumber || '',
            teacherId: subjectData.semester1?.teacherId
          });

          // Row for Học kỳ II
          transformedData.push({
            stt: stt++,
            subjectName: subjectData.subjectName,
            semesterName: 'Học kỳ II',
            semester: 2,
            teacherName: subjectData.semester2?.teacherName || '',
            personalId: subjectData.semester2?.personalId || '',
            phoneNumber: subjectData.semester2?.phoneNumber || '',
            teacherId: subjectData.semester2?.teacherId
          });
        });

        this.datas = transformedData;
        this.ref.detectChanges();
      },
      error => {
        console.error('Error loading teacher subject data:', error);
        this.notificationService.showNotification(
          Constant.ERROR,
          'Không thể tải danh sách giáo viên bộ môn'
        );
        this.datas = [];
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


  onExporting(e: ExportingEvent) {
    let cls = this.classSource.find(en => en.id === this.filterClassId);
    let clsName = cls ? cls.name.toUpperCase() : 'ALL';

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('GiaoVienBoMon');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `DS_GIAOVIEN_BOMON_${clsName}.xlsx`
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