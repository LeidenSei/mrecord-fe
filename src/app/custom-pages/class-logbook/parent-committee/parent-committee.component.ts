import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService, ScreenService } from "../../../services";
import { GeneralService } from "../../../services/general.service";
import { ParentCommitteeService, ParentCommitteeDto, ParentCommitteeRequest, ParentCommitteeUpdateRequest } from "../../../services/parent-committee.service";
import { NotificationService } from "../../../services/notification.service";
import { Constant } from "../../../shared/constants/constant.class";
import { forkJoin } from 'rxjs';
import { ExportingEvent } from "devextreme/ui/data_grid";
import { Workbook } from "exceljs";
import { exportDataGrid as exportDataGridToXLSX } from "devextreme/excel_exporter";
import { saveAs } from 'file-saver-es';

@Component({
  selector: 'app-parent-committee',
  templateUrl: './parent-committee.component.html',
  styleUrls: ['./parent-committee.component.scss']
})
export class ParentCommitteeComponent implements OnInit {
  datas: ParentCommitteeDto[] = [];
  committeeCount = 0;

  gradeSource = [];
  classSource = [];
  filterClassSource: any[] = [];
  filterClassId: any = null;
  filterGrade: any = 0;
  schoolYearId: number = 2025;
  
  positionFilterSource = [
    { value: '', name: 'Tất cả chức vụ' },
    { value: 'president', name: 'Trưởng ban' },
    { value: 'vice_president', name: 'Phó ban' },
    { value: 'secretary', name: 'Thư ký' },
    { value: 'treasurer', name: 'Thủ quỹ' },
    { value: 'member', name: 'Ủy viên' }
  ];
  selectedPositionFilter = '';

  studentSource: any[] = [];
  parentSource: any[] = [];
  
  positionSource = [
    { value: 'president', name: 'Trưởng ban' },
    { value: 'vice_president', name: 'Phó ban' },
    { value: 'secretary', name: 'Thư ký' },
    { value: 'treasurer', name: 'Thủ quỹ' },
    { value: 'member', name: 'Ủy viên' }
  ];

  relationshipSource = [
    { value: 'father', name: 'Cha' },
    { value: 'mother', name: 'Mẹ' },
    { value: 'guardian', name: 'Người giám hộ' }
  ];

  exportTexts = {
    exportAll: 'Xuất dữ liệu excel',
    exportSelectedRows: 'Xuất dòng được chọn',
    exportTo: 'Xuất ra'
  };

  parentInputMode: string = 'existing';
  isAdmin = false;
  
  currentClassName: string = '';
  currentGradeName: string = '';
  allClasses: any[] = [];
  constructor(
    public screen: ScreenService,
    public generalService: GeneralService,
    public authService: AuthService,
    private parentCommitteeService: ParentCommitteeService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef 
  ) { }

  async ngOnInit() {
      const user = await this.authService.getUser();
      this.isAdmin = user.data.role === 2;

      forkJoin([
        this.generalService.getListGradeOfSchool(user.data.schoolId),
        this.generalService.getListClassByTeacher(user.data.schoolId, user.data.personId),
        this.generalService.getListClassBySchool(user.data.schoolId)
      ]).subscribe(([gradeSource, classSource, schoolClassSource]) => {
        this.allClasses = (user.data.role === 2 || user.data.isBGH) ? schoolClassSource : classSource;
        this.classSource = [...this.allClasses];
        
        let filterGradeIds = classSource.map(en => en.grade);
        
        // Transform gradeSource thành array of objects
        const grades = (user.data.role === 2 || user.data.isBGH) 
          ? gradeSource 
          : gradeSource.filter(en => filterGradeIds.includes(en));
        
        this.gradeSource = grades.map(grade => ({
          value: grade,
          text: `Khối ${grade}`
        }));

        this.filterGrade = this.gradeSource[0]?.value; // Lấy value thay vì cả object
        
        this.filterClassSource = this.allClasses.filter(en => 
          !this.filterGrade || en.grade === this.filterGrade
        );

        if (this.filterClassSource.length > 0) {
          this.filterClassId = this.filterClassSource[0].id;
          this.updateCurrentClassInfo();
          this.loadCommitteeData();
          this.loadStudentAndParentData();
        }
      });
  }

  updateCurrentClassInfo(): void {
    const currentClass = this.classSource.find(en => en.id === this.filterClassId);
    if (currentClass) {
      this.currentClassName = currentClass.name;
      this.currentGradeName = `Khối ${currentClass.grade}`;
    }
  }

  loadCommitteeData(): void {
    if (!this.filterClassId || !this.schoolYearId) return;

    this.parentCommitteeService.getListByClass(
      this.filterClassId, 
      this.schoolYearId, 
      this.selectedPositionFilter
    ).subscribe(
      res => {
        this.datas = res;
        this.committeeCount = this.datas.length;
      },
      error => {
        this.notificationService.showNotification(Constant.ERROR, 'Lỗi khi tải dữ liệu ban đại diện');
        console.error(error);
      }
    );
  }

  loadStudentAndParentData(): void {
    if (!this.filterClassId) return;

    this.generalService.getListStudentByClass2(this.filterClassId).subscribe(
      students => {
        const currentClass = this.classSource.find(en => en.id === this.filterClassId);
        this.studentSource = students.map(s => ({
          id: s.id,
          fullName: s.fullName,
          code: s.code,
          displayText: currentClass ? `${s.fullName} (${currentClass.name})` : s.fullName
        }));
      },
      error => {
        console.error('Error loading students:', error);
      }
    );

    this.loadParentsFromStudents();
  }

  loadParentsFromStudents(): void {
    this.generalService.getListStudentByClass2(this.filterClassId).subscribe(
      students => {
        const parents: any[] = [];
        students.forEach(student => {
          if (student.contacts && student.contacts.length > 0) {
            student.contacts.forEach(contact => {
              if (contact.parentId) {
                const existingParent = parents.find(p => p.id === contact.parentId);
                if (!existingParent) {
                  parents.push({
                    id: contact.parentId,
                    fullName: contact.parentName || contact.name || 'Chưa có tên',
                    phoneNo: contact.value,
                    studentId: student.id
                  });
                }
              }
            });
          }
        });
        this.parentSource = parents;
      },
      error => {
        console.error('Error loading parents:', error);
      }
    );
  }

gradeChange($event: any): void {
    console.log('=== GRADE CHANGE ===');
    
    this.filterGrade = $event.itemData.value;
    
    if (!Number.isNaN(this.filterGrade) && this.filterGrade !== 0) {
      this.filterClassSource = this.classSource.filter(en => 
        en.grade === +this.filterGrade
      );
    } else {
      this.filterClassSource = this.classSource;
    }
    
    console.log('filterClassSource:', this.filterClassSource);
    
    this.selectedPositionFilter = '';

    // Reset về null trước
    this.filterClassId = null;
    
    // Force Angular detect changes
    this.cdr.detectChanges();
    
    // Rồi mới set giá trị mới
    if (this.filterClassSource.length > 0) {
      this.filterClassId = this.filterClassSource[0].id;
      
      console.log('Set filterClassId =', this.filterClassId);
      
      // Force Angular detect changes lần nữa
      this.cdr.detectChanges();
      
      this.updateCurrentClassInfo();
      this.loadCommitteeData();
      this.loadStudentAndParentData();
    } else {
      this.datas = [];
      this.committeeCount = 0;
    }
    
    console.log('===================');
}

  classChange($event): void {
    this.filterClassId = $event.itemData.id;
    this.updateCurrentClassInfo();
    this.loadCommitteeData();
    this.loadStudentAndParentData();
  }

  positionFilterChange(event: any): void {
    this.selectedPositionFilter = event.itemData.value;
    this.loadCommitteeData();
  }

  onExporting(event: ExportingEvent): void {
    let cls = this.classSource.find(en => en.id === this.filterClassId);
    let clsName = cls ? cls.name.toUpperCase() : 'ALL';
    
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('BanDaiDienPhuHuynh');

    exportDataGridToXLSX({
      component: event.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }), 
          `BAN_DAI_DIEN_PH_${clsName}.xlsx`
        );
      });
    });
    event.cancel = true;
  }

  onRowUpdating(event: any): void {
    const request: ParentCommitteeUpdateRequest = {
      id: event.key,
      position: event.newData.position !== undefined ? event.newData.position : event.oldData.position,
      relationship: event.newData.relationship !== undefined ? event.newData.relationship : event.oldData.relationship,
      note: event.newData.note !== undefined ? event.newData.note : event.oldData.note
    };

    this.parentCommitteeService.update(request).subscribe(
      res => {
        if (res.errorCode === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, res.message);
          this.loadCommitteeData();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
          event.cancel = true;
        }
      },
      error => {
        this.notificationService.showNotification(Constant.ERROR, 'Có lỗi xảy ra khi cập nhật');
        console.error(error);
        event.cancel = true;
      }
    );
  }

  onRowInserting(event: any): void {
    const isExistingParent = this.parentInputMode === 'existing';
    
    if (isExistingParent && !event.data.parentId) {
      this.notificationService.showNotification(Constant.ERROR, 'Vui lòng chọn phụ huynh');
      event.cancel = true;
      return;
    }
    
    if (!isExistingParent && (!event.data.parentName || !event.data.parentPhone)) {
      this.notificationService.showNotification(Constant.ERROR, 'Vui lòng nhập tên và số điện thoại phụ huynh');
      event.cancel = true;
      return;
    }
    
    if (!event.data.studentId || !event.data.position || !event.data.relationship) {
      this.notificationService.showNotification(Constant.ERROR, 'Vui lòng điền đầy đủ thông tin bắt buộc');
      event.cancel = true;
      return;
    }

    const request: ParentCommitteeRequest = {
      parentId: isExistingParent ? event.data.parentId : undefined,
      parentName: !isExistingParent ? event.data.parentName : undefined,
      parentPhone: !isExistingParent ? event.data.parentPhone : undefined,
      workplace: event.data.workplace || '',
      studentId: event.data.studentId,
      classId: this.filterClassId,
      schoolYearId: this.schoolYearId,
      position: event.data.position,
      relationship: event.data.relationship,
      note: event.data.note || ''
    };

    this.parentCommitteeService.create(request).subscribe(
      res => {
        if (res.errorCode === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, res.message);
          this.loadCommitteeData();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
          event.cancel = true;
        }
      },
      error => {
        this.notificationService.showNotification(Constant.ERROR, 'Có lỗi xảy ra khi thêm mới');
        console.error(error);
        event.cancel = true;
      }
    );
  }

  onRowRemoving(event: any): void {
    this.parentCommitteeService.remove(event.key).subscribe(
      res => {
        if (res.errorCode === 0) {
          this.notificationService.showNotification(Constant.SUCCESS, res.message);
          this.loadCommitteeData();
        } else {
          this.notificationService.showNotification(Constant.ERROR, res.message);
          event.cancel = true;
        }
      },
      error => {
        this.notificationService.showNotification(Constant.ERROR, 'Có lỗi xảy ra khi xóa');
        console.error(error);
        event.cancel = true;
      }
    );
  }

  getPositionText(position: string): string {
    const pos = this.positionSource.find(p => p.value === position);
    return pos ? pos.name : position;
  }

  getPositionClass(position: string): string {
    const classes = {
      'president': 'position-president',
      'vice_president': 'position-vice-president',
      'secretary': 'position-secretary',
      'treasurer': 'position-treasurer',
      'member': 'position-member'
    };
    return classes[position as keyof typeof classes] || '';
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  get schoolYearDisplay(): string {
    return `${this.schoolYearId - 1}-${this.schoolYearId}`;
  }
}