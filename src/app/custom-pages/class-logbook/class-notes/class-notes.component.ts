import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { ClassCommentService } from 'src/app/services/class-comment.service';
import { StudentService } from 'src/app/services/student.service';
import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

@Component({
  selector: 'app-class-notes',
  templateUrl: './class-notes.component.html',
  styleUrls: ['./class-notes.component.scss']
})
export class ClassNotesComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  
  datas: any[] = [];
  notesCount = 0;
  
  currentSchoolId: string = '';
  currentClassId: string = '';
  currentSchoolYear: number = new Date().getFullYear();
  currentPersonId: string = '';
  isAdmin: boolean = false;
  
  selectedGrade: string = 'Tất cả';
  selectedPriorityFilter: string = 'all';
  filterClassId: string = '';
  
  gradeSource: string[] = ['Tất cả'];
  filterClassSource: any[] = [];
  
  priorityFilterSource = [
    { value: 'all', name: 'Tất cả' },
    { value: 'high', name: 'Cao' },
    { value: 'medium', name: 'Trung bình' },
    { value: 'low', name: 'Thấp' }
  ];
  
  categorySource = [
    { value: 'academic', name: 'Học tập' },
    { value: 'behavior', name: 'Hành vi' },
    { value: 'health', name: 'Sức khỏe' },
    { value: 'family', name: 'Gia đình' },
    { value: 'attendance', name: 'Điểm danh' },
    { value: 'other', name: 'Khác' }
  ];
  
  prioritySource = [
    { value: 'high', name: 'Cao' },
    { value: 'medium', name: 'Trung bình' },
    { value: 'low', name: 'Thấp' }
  ];
  
  statusSource = [
    { value: 'new', name: 'Mới' },
    { value: 'progress', name: 'Đang xử lý' },
    { value: 'resolved', name: 'Đã giải quyết' },
    { value: 'monitoring', name: 'Theo dõi' }
  ];
  
  studentSource: any[] = [];
  
  exportTexts = {
    exportAll: 'Xuất Excel',
    exportSelectedRows: 'Xuất dữ liệu đã chọn',
    exportTo: 'Xuất ra'
  };

  constructor(
    private classCommentService: ClassCommentService,
    private studentService: StudentService,
    private classService: ClassService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.currentSchoolId = user.data.schoolId;
    this.currentPersonId = user.data.personId;
    this.currentSchoolYear = new Date().getFullYear();
    this.isAdmin = user.data.role === 2 || user.data.isBGH;

    if (this.currentSchoolId) {
      await this.loadClassData(user);
    } else {
      notify('Không tìm thấy thông tin trường học', 'warning', 3000);
    }
  }

  async loadClassData(user: any): Promise<void> {
    try {
      let classesResponse: any;
      
      if (this.isAdmin) {
        classesResponse = await this.classService.getListBySchool(this.currentSchoolId).toPromise();
      } else {
        if (typeof this.classService.getListByTeacher === 'function') {
          classesResponse = await this.classService.getListByTeacher(
            this.currentSchoolId, 
            this.currentPersonId
          ).toPromise();
        } else {
          classesResponse = await this.classService.getListBySchool(this.currentSchoolId).toPromise();
        }
      }
      
      const classes = this.extractData(classesResponse);
      
      if (classes.length === 0) {
        notify('Không tìm thấy lớp học nào', 'warning', 3000);
        return;
      }
      
      const gradeIds = [...new Set(classes.map((c: any) => c.grade).filter((g: any) => g))].sort();
      this.gradeSource = ['Tất cả', ...gradeIds.map((g: number) => `Lớp ${g}`)];
      
      this.filterClassSource = [
        { id: null, name: 'Tất cả lớp' },
        ...classes.map((c: any) => ({ 
          id: c.id, 
          name: c.name || c.tenLop || c.className 
        }))
      ];
      
      if (this.filterClassSource.length > 1) {
        this.filterClassId = this.filterClassSource[1].id;
        this.currentClassId = this.filterClassId;
      }
      
      this.loadData();
    } catch (err) {
      console.error('Error loading classes:', err);
      notify('Lỗi khi tải danh sách lớp', 'error', 3000);
      this.filterClassSource = [{ id: null, name: 'Tất cả lớp' }];
    }
  }

  private extractData(response: any): any[] {
    if (!response) return [];
    
    if (response.data !== undefined) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  }

  loadData() {
    this.loadStudents();
    this.loadNotes();
    this.loadNotesCount();
  }

  loadStudents() {
    if (!this.currentClassId) return;
    
    this.studentService.getListByClass(this.currentClassId).subscribe({
      next: (data) => {
        this.studentSource = data.map((student: any) => ({
          id: student.Id || student.id,
          code: student.Code || student.code,
          fullName: student.FullName || student.fullName || `${student.FirstName} ${student.LastName}`,
          className: student.ClassName || student.className
        }));
      },
      error: (err) => {
        notify('Không thể tải danh sách học sinh', 'error', 2000);
      }
    });
  }

  loadNotes() {
    if (!this.currentClassId) return;
    const priority = this.selectedPriorityFilter === 'all' ? undefined : this.selectedPriorityFilter;
    
    this.classCommentService.getListByClass(
      this.currentClassId, 
      this.currentSchoolYear,
      undefined,
      priority 
    ).subscribe({
      next: (data) => {
        const filteredData = data.filter((item: any) => 
          item.loai !== 'NHAN_XET_CUOI_KY'
        );
        
        this.datas = filteredData.map((item: any, index: number) => ({
          id: item.id,
          stt: index + 1,
          date: item.ngaY_GHI ? new Date(item.ngaY_GHI) : null,
          category: item.loai,
          title: item.tieU_DE,
          priority: item.muC_DO_UU_TIEN,
          status: item.tranG_THAI,
          studentName: item.teN_HOC_SINH_LIEN_QUAN,
          content: item.noI_DUNG,
          actionRequired: item.hanH_DONG_CAN_THIET,
          followUpDate: item.ngaY_THEO_DOI ? new Date(item.ngaY_THEO_DOI) : null,
          createdBy: item.teN_NGUOI_TAO,
          dateCreated: item.dateCreated,
          ...item
        }));
      },
      error: (err) => {
        notify('Không thể tải danh sách ghi chú', 'error', 2000);
      }
    });
  }

  loadNotesCount() {
    if (!this.currentClassId) return;
    
    this.classCommentService.countByClass(
      this.currentClassId,
      this.currentSchoolYear
    ).subscribe({
      next: (count) => {
        this.notesCount = count;
      }
    });
  }

  onRowInserting(e: any) {
    e.cancel = true;
    
    if (!e.data.title) {
      notify('Vui lòng nhập tiêu đề', 'warning', 2000);
      return;
    }
    
    if (!e.data.priority) {
      notify('Vui lòng chọn mức độ ưu tiên', 'warning', 2000);
      return;
    }
    
    const payload = {
      ClassId: this.currentClassId,
      MA_NAM_HOC: this.currentSchoolYear,
      NGAY_GHI: e.data.date || new Date().toISOString(),
      LOAI: e.data.category || '',
      TIEU_DE: e.data.title,
      MUC_DO_UU_TIEN: e.data.priority,
      TRANG_THAI: e.data.status || 'new',
      TEN_HOC_SINH_LIEN_QUAN: e.data.studentName || '',
      NOI_DUNG: e.data.content || '',
      HANH_DONG_CAN_THIET: e.data.actionRequired || '',
      NGAY_THEO_DOI: e.data.followUpDate || null
    };
    
    this.classCommentService.create(payload).subscribe({
      next: (response) => {
        notify(response.message || 'Tạo ghi chú thành công', 'success', 2000);
        e.component.cancelEditData();
        this.loadNotes();
        this.loadNotesCount();
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Có lỗi xảy ra khi tạo ghi chú';
        notify(errorMessage, 'error', 3000);
      }
    });
  }

  onRowUpdating(e: any) {
    e.cancel = true;
    
    const mergedData = { ...e.oldData, ...e.newData };
    
    if (!mergedData.dateCreated) {
      notify('Không tìm thấy thông tin để cập nhật', 'error', 2000);
      return;
    }
    
    const payload = {
      DateCreated: mergedData.dateCreated,
      ClassId: this.currentClassId,
      MA_NAM_HOC: this.currentSchoolYear,
      NGAY_GHI: mergedData.date || mergedData.ngaY_GHI,
      LOAI: mergedData.category || mergedData.loai,
      TIEU_DE: mergedData.title || mergedData.tieU_DE,
      MUC_DO_UU_TIEN: mergedData.priority || mergedData.muC_DO_UU_TIEN,
      TRANG_THAI: mergedData.status || mergedData.tranG_THAI,
      TEN_HOC_SINH_LIEN_QUAN: mergedData.studentName || mergedData.teN_HOC_SINH_LIEN_QUAN || '',
      NOI_DUNG: mergedData.content || mergedData.noI_DUNG || '',
      HANH_DONG_CAN_THIET: mergedData.actionRequired || mergedData.hanH_DONG_CAN_THIET || '',
      NGAY_THEO_DOI: mergedData.followUpDate || mergedData.ngaY_THEO_DOI || null
    };
    
    this.classCommentService.update(payload).subscribe({
      next: (response) => {
        notify(response.message || 'Cập nhật thành công', 'success', 2000);
        e.component.cancelEditData();
        this.loadNotes();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật';
        notify(errorMessage, 'error', 3000);
      }
    });
  }
  
  onRowRemoving(e: any) {
    e.cancel = true;
    
    const id = e.data.id;
    
    if (!id) {
      notify('Không tìm thấy thông tin để xóa', 'error', 2000);
      return;
    }

    this.classCommentService.delete(id).subscribe({
      next: (response) => {
        notify(response.message || 'Xóa thành công', 'success', 2000);
        this.loadNotes();
        this.loadNotesCount();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi xóa';
        notify(errorMessage, 'error', 3000);
      }
    });
  }

  gradeChange(e: any) {
    this.selectedGrade = e.itemData;
  }

  classChange(e: any) {
    this.filterClassId = e.itemData.id;
    this.currentClassId = e.itemData.id;
    this.loadData();
  }

  priorityFilterChange(e: any) {
    this.selectedPriorityFilter = e.itemData.value;
    this.loadNotes();
  }

  onExporting(e: any) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Ghi chú');

    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }: any) => {
        if (gridCell.rowType === 'data') {
          if (gridCell.column.dataField === 'date' || gridCell.column.dataField === 'followUpDate') {
            if (gridCell.value) {
              excelCell.value = new Date(gridCell.value);
              excelCell.numFmt = 'dd/mm/yyyy';
            }
          }
        }
      }
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `Ghi_chu_lop_${new Date().getTime()}.xlsx`
        );
      });
    });

    e.cancel = true;
  }

  getPriorityText(value: string): string {
    if (!value) return '';
    const priority = this.prioritySource.find(x => x.value === value);
    return priority ? priority.name : value;
  }

  getStatusText(value: string): string {
    if (!value) return '';
    const status = this.statusSource.find(x => x.value === value);
    return status ? status.name : value;
  }

  getCategoryText(value: string): string {
    if (!value) return '';
    const category = this.categorySource.find(x => x.value === value);
    return category ? category.name : value;
  }

  isOverdue(date: any): boolean {
    if (!date) return false;
    const followUpDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate < today;
  }

  isSoon(date: any): boolean {
    if (!date) return false;
    const followUpDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    followUpDate.setHours(0, 0, 0, 0);
    const diffTime = followUpDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  }
}