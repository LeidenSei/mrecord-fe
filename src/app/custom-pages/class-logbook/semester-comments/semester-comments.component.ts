import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { ClassCommentService } from 'src/app/services/class-comment.service';
import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';

@Component({
  selector: 'app-semester-comments',
  templateUrl: './semester-comments.component.html',
  styleUrls: ['./semester-comments.component.scss']
})
export class SemesterCommentsComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  
  datas: any[] = [];
  
  currentSchoolId: string = '';
  currentClassId: string = '';
  currentSchoolYear: number = new Date().getFullYear();
  currentPersonId: string = '';
  isAdmin: boolean = false;
  
  selectedSemester: number | string = 'all';
  filterClassId: string = '';
  
  filterClassSource: any[] = [];
  
  semesterSource = [
    { value: 'all', name: 'Cả năm' },   
    { value: 1, name: 'Học kỳ I' },
    { value: 2, name: 'Học kỳ II' }
  ];
  
  exportTexts = {
    exportAll: 'Xuất Excel',
    exportSelectedRows: 'Xuất dữ liệu đã chọn',
    exportTo: 'Xuất ra'
  };

  constructor(
    private classCommentService: ClassCommentService,
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
    if (!this.currentClassId) return;

    const semester = this.selectedSemester === 'all' 
      ? undefined 
      : Number(this.selectedSemester);
    
    this.classCommentService.getListByClass(
      this.currentClassId, 
      this.currentSchoolYear,
      'NHAN_XET_CUOI_KY',  
      undefined,
      semester      
    ).subscribe({
      next: (data) => {
        this.datas = data.map((item: any, index: number) => ({
          id: item.id,
          stt: index + 1,
          date: item.ngaY_GHI ? new Date(item.ngaY_GHI) : null,
          semester: item.hoC_KY,
          title: item.tieU_DE,
          content: item.noI_DUNG,
          createdBy: item.teN_NGUOI_TAO,
          dateCreated: item.dateCreated,
          ...item
        }));
      },
      error: (err) => {
        notify('Không thể tải danh sách nhận xét', 'error', 2000);
      }
    });
  }

  semesterChange(e: any) {
    this.selectedSemester = e.itemData.value;
    this.loadData();
  }
  onRowInserting(e: any) {
    e.cancel = true;
    
    if (!e.data.title) {
      notify('Vui lòng nhập tiêu đề', 'warning', 2000);
      return;
    }
    
    const payload = {
      ClassId: this.currentClassId,
      MA_NAM_HOC: this.currentSchoolYear,
      LOAI: 'NHAN_XET_CUOI_KY',
      HOC_KY: e.data.semester || null,
      NGAY_GHI: e.data.date || new Date().toISOString(),
      TIEU_DE: e.data.title,
      NOI_DUNG: e.data.content || ''
    };
    
    this.classCommentService.create(payload).subscribe({
      next: (response) => {
        notify(response.message || 'Tạo nhận xét thành công', 'success', 2000);
        e.component.cancelEditData();
        this.loadData();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi tạo nhận xét';
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
      LOAI: 'NHAN_XET_CUOI_KY',
      HOC_KY: mergedData.semester || mergedData.hoC_KY || null,
      NGAY_GHI: mergedData.date || mergedData.ngaY_GHI,
      TIEU_DE: mergedData.title || mergedData.tieU_DE,
      NOI_DUNG: mergedData.content || mergedData.noI_DUNG || ''
    };
    
    this.classCommentService.update(payload).subscribe({
      next: (response) => {
        notify(response.message || 'Cập nhật thành công', 'success', 2000);
        e.component.cancelEditData();
        this.loadData();
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
        this.loadData();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi xóa';
        notify(errorMessage, 'error', 3000);
      }
    });
  }

  classChange(e: any) {
    this.filterClassId = e.itemData.id;
    this.currentClassId = e.itemData.id;
    this.loadData();
  }

  onExporting(e: any) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Nhận xét cuối kỳ');

    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      autoFilterEnabled: true
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `Nhan_xet_cuoi_ky_${new Date().getTime()}.xlsx`
        );
      });
    });

    e.cancel = true;
  }

  getSemesterText(value: number): string {
    if (value === null || value === undefined) return '';
    const semester = this.semesterSource.find(x => x.value === value);
    return semester ? semester.name : '';
  }
}