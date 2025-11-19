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
  selector: 'app-parent-committee-c2',
  templateUrl: './parent-committee-c2.component.html',
  styleUrls: ['./parent-committee-c2.component.scss']
})
export class ParentCommitteeC2Component implements OnInit {
  datas: ParentCommitteeDto[] = [];
  committeeCount = 0;
  filterGrade: string = 'Tất cả';
  gradeSource: string[] = ['Tất cả'];
  classSource = [];
  filterClassSource: any[] = [];
  filterClassId: any = null;
  schoolYearId: number = 2025; // giữ mặc định, thay nếu cần

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
  isEditMode = false;

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
      // Fallback nếu classSource rỗng
      let rawClasses: any[];
      if (user.data.role === 2 || user.data.isBGH || classSource.length === 0) {
        rawClasses = schoolClassSource;
      } else {
        rawClasses = classSource;
      }

      // Map classes thành format chuẩn có id
      this.allClasses = rawClasses.map((cls: any) => ({
        id: cls.id,
        name: cls.name || cls.tenLop || cls.shortName,
        grade: cls.grade
      }));

      this.classSource = [...this.allClasses];

      // Lấy danh sách khối THỰC SỰ có lớp trong allClasses
      const actualGrades = [...new Set(this.allClasses.map(c => c.grade))].sort();

      // === CHỈ DÙNG KHỐI CẤP 2 (6-9) ===
      const c2Grades = actualGrades.filter(g => g >= 6 && g <= 9);
      this.gradeSource = ['Tất cả', ...c2Grades.map(grade => `Khối ${grade}`)];
      // =====================================

      // Khởi tạo filterClassSource với "Tất cả lớp" và các lớp cấp 2
      this.filterClassSource = [
        { id: null, name: 'Tất cả lớp' },
        ...this.allClasses.filter(c => c.grade >= 6 && c.grade <= 9)
      ];

      // Mặc định chọn lớp đầu tiên (sau "Tất cả lớp")
      if (this.filterClassSource.length > 1) {
        this.filterClassId = this.filterClassSource[1].id;
        this.updateCurrentClassInfo();
        this.loadCommitteeData();
        this.loadStudentAndParentData();
      } else {
        // nếu không có lớp cấp 2, clear dữ liệu
        this.filterClassId = null;
        this.datas = [];
        this.committeeCount = 0;
      }
    });
  }

  updateCurrentClassInfo(): void {
    const currentClass = this.classSource.find(en => en.id === this.filterClassId);
    if (currentClass) {
      this.currentClassName = currentClass.name;
      this.currentGradeName = `Khối ${currentClass.grade}`;
    } else {
      this.currentClassName = '';
      this.currentGradeName = '';
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

  getGradeNumber(gradeText: string): number | undefined {
    if (gradeText === 'Tất cả') return undefined;
    const match = gradeText.match(/\d+/);
    return match ? parseInt(match[0]) : undefined;
  }

  gradeChange($event: any): void {
    this.filterGrade = $event.itemData;

    if (this.filterGrade === 'Tất cả') {
      this.filterClassSource = [
        { id: null, name: 'Tất cả lớp' },
        ...this.allClasses.filter(c => c.grade >= 6 && c.grade <= 9)
      ];
    } else {
      const gradeNumber = this.getGradeNumber(this.filterGrade);

      if (gradeNumber !== undefined) {
        const filteredClasses = this.allClasses.filter(c => c.grade === gradeNumber);

        this.filterClassSource = [
          { id: null, name: 'Tất cả lớp' },
          ...filteredClasses
        ];

        if (filteredClasses.length > 0) {
          this.filterClassId = filteredClasses[0].id;
          this.updateCurrentClassInfo();
          this.loadCommitteeData();
          this.loadStudentAndParentData();
        } else {
          this.filterClassId = null;
          this.datas = [];
          this.committeeCount = 0;
          this.notificationService.showNotification(Constant.INFO, 'Không có lớp nào trong khối này');
        }
      }
    }
  }

  classChange($event): void {
    this.filterClassId = $event.itemData.id;

    if (this.filterClassId) {
      this.updateCurrentClassInfo();
      this.loadCommitteeData();
      this.loadStudentAndParentData();
    } else {
      this.datas = [];
      this.committeeCount = 0;
      this.studentSource = [];
      this.parentSource = [];
    }
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

  onEditingStart(event: any): void {
    this.isEditMode = true;
  }

  onInitNewRow(event: any): void {
    this.isEditMode = false;
    this.parentInputMode = 'existing';
  }

  onRowUpdating(event: any): void {
    const recordId = typeof event.key === 'string' ? event.key : event.key?.id;

    if (!recordId) {
      this.notificationService.showNotification(Constant.ERROR, 'Không tìm thấy ID bản ghi');
      event.cancel = true;
      return;
    }

    const request: ParentCommitteeUpdateRequest = {
      id: recordId,
      parentName: event.newData.parentName !== undefined ? event.newData.parentName : event.oldData.parentName,
      parentPhone: event.newData.parentPhone !== undefined ? event.newData.parentPhone : event.oldData.parentPhone,
      position: event.newData.position !== undefined ? event.newData.position : event.oldData.position,
      relationship: event.newData.relationship !== undefined ? event.newData.relationship : event.oldData.relationship,
      workplace: event.newData.workplace !== undefined ? event.newData.workplace : event.oldData.workplace,
      note: event.newData.note !== undefined ? event.newData.note : event.oldData.note
    };

    this.parentCommitteeService.update(request).subscribe(
      res => {
        if (res.code === 0) {
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

  onRowRemoving(event: any): void {
    const recordId = typeof event.key === 'string' ? event.key : event.key?.id;

    if (!recordId) {
      this.notificationService.showNotification(Constant.ERROR, 'Không tìm thấy ID bản ghi');
      event.cancel = true;
      return;
    }

    this.parentCommitteeService.remove(recordId).subscribe(
      res => {
        if (res.code === 0) {
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
        if (res.code === 0) {
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
    return `${this.schoolYearId} - ${this.schoolYearId + 1}`;
  }
}
