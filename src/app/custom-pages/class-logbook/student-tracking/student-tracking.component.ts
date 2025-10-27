import { Component, OnInit } from '@angular/core';
import { GridApi, GridReadyEvent, ColDef, GridOptions, CellValueChangedEvent, CellClickedEvent } from 'ag-grid-community';
import { StudentTrackingService } from 'src/app/services/student-tracking.service';
import { StudentService } from 'src/app/services/student.service';
import { ClassService } from 'src/app/services/class.service';
import { AuthService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-student-tracking',
  templateUrl: './student-tracking.component.html',
  styleUrls: ['./student-tracking.component.scss']
})
export class StudentTrackingComponent implements OnInit {
  
  private gridApi!: GridApi;
  public columnDefs: ColDef[] = [];
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: false,
    suppressSizeToFit: false
  };
  public gridOptions: GridOptions = {
    rowHeight: 40,
    headerHeight: 45,
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
    singleClickEdit: false,
    stopEditingWhenCellsLoseFocus: true,
    animateRows: true,
    suppressColumnVirtualisation: false,
    getRowClass: (params) => {
      if (params.data?.isNew) {
        return 'ag-row-first';
      }
      return '';
    }
  };
  
  rowData: any[] = [];
  studentList: any[] = [];
  selectedStudent: any = null;
  trackingCount = 0;
  
  currentSchoolId: string = '';
  currentClassId: string = '';
  currentSchoolYear: number = new Date().getFullYear();
  currentPersonId: string = '';
  isAdmin: boolean = false;
  
  selectedPeriod: string = 'all';
  filterClassId: string = '';
  
  filterClassSource: any[] = [];
  
  periodSource = [
    { value: 'all', name: 'Tất cả' },
    { value: 'GIUA_KY_1', name: 'Giữa kỳ I' },
    { value: 'CUOI_KY_1', name: 'Cuối kỳ I' },
    { value: 'GIUA_KY_2', name: 'Giữa kỳ II' },
    { value: 'CUOI_KY_2', name: 'Cuối kỳ II' },
    { value: 'TONG_KET_NAM', name: 'Tổng kết năm' }
  ];
  
  categorySource = [
    { value: 'academic', name: 'Học tập' },
    { value: 'behavior', name: 'Hành vi' },
    { value: 'health', name: 'Sức khỏe' },
    { value: 'family', name: 'Gia đình' },
    { value: 'attitude', name: 'Thái độ' },
    { value: 'other', name: 'Khác' }
  ];
  
  prioritySource = [
    { value: 'high', name: 'Cao' },
    { value: 'medium', name: 'Trung bình' },
    { value: 'low', name: 'Thấp' }
  ];

  constructor(
    private studentTrackingService: StudentTrackingService,
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

    this.setupColumnDefs();

    if (this.currentSchoolId) {
      await this.loadClassData(user);
    } else {
      notify('Không tìm thấy thông tin trường học', 'warning', 3000);
    }
  }

  setupColumnDefs() {
    this.columnDefs = [
      {
        headerName: 'STT',
        valueGetter: 'node.rowIndex + 1',
        width: 70,
        pinned: 'left',
        editable: false,
        resizable: true,
        suppressSizeToFit: true,
        cellStyle: { 
          textAlign: 'center',
          fontWeight: '500'
        },
        cellClass: 'stt-cell'
      },
      {
        headerName: 'Mốc thời gian',
        field: 'period',
        width: 140,
        editable: true,
        resizable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: this.periodSource.map(p => p.value)
        },
        valueFormatter: (params) => this.getPeriodText(params.value),
        cellStyle: { textAlign: 'center' }
      },
      {
        headerName: 'Vấn đề quan tâm',
        field: 'issue',
        width: 280,
        flex: 1,
        editable: true,
        resizable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          maxLength: 500,
          rows: 5,
          cols: 50
        },
        wrapText: true,
        autoHeight: true
      },
      {
        headerName: 'Biện pháp can thiệp',
        field: 'intervention',
        width: 280,
        flex: 1,
        editable: true,
        resizable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          maxLength: 500,
          rows: 5,
          cols: 50
        },
        wrapText: true,
        autoHeight: true
      },
      {
        headerName: 'Kết quả',
        field: 'result',
        width: 280,
        flex: 1,
        editable: true,
        resizable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          maxLength: 500,
          rows: 5,
          cols: 50
        },
        wrapText: true,
        autoHeight: true
      },
      {
        headerName: 'Phân loại',
        field: 'category',
        width: 120,
        editable: true,
        resizable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: this.categorySource.map(c => c.value)
        },
        valueFormatter: (params) => this.getCategoryText(params.value),
        cellStyle: { textAlign: 'center' }
      },
      {
        headerName: 'Mức độ',
        field: 'priority',
        width: 120,
        editable: true,
        resizable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: this.prioritySource.map(p => p.value)
        },
        valueFormatter: (params) => this.getPriorityText(params.value),
        cellRenderer: (params: any) => {
          if (!params.value) return '';
          const priority = this.prioritySource.find(p => p.value === params.value);
          const colorClass = params.value === 'high' ? 'danger' : 
                           params.value === 'medium' ? 'warning' : 'success';
          return `<span class="badge bg-${colorClass}">${priority?.name || ''}</span>`;
        },
        cellStyle: { textAlign: 'center' }
      },
      {
        headerName: 'Thao tác',
        field: 'actions',
        width: 120,
        pinned: 'right',
        editable: false,
        sortable: false,
        filter: false,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (params: any) => {
          const container = document.createElement('div');
          container.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;width:100%;';
          
          if (!params.data || !params.data.id || params.data.isNew) {
            const span = document.createElement('span');
            span.textContent = 'Chưa lưu';
            span.style.cssText = 'color:#6c757d;font-size:11px;font-style:italic;';
            container.appendChild(span);
            return container;
          }
          
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = '🗑️ Xóa';
          button.setAttribute('data-id', params.data.id);
          button.className = 'btn-delete';
          button.style.cssText = 'padding: 0px 6px;font-size:10px;font-weight:500;border-radius:4px;border:1px solid #dc3545;background:#dc3545;color:#fff;cursor:pointer;white-space:nowrap;';
          
          button.onmouseenter = () => {
            button.style.background = '#c82333';
            button.style.borderColor = '#bd2130';
          };
          button.onmouseleave = () => {
            button.style.background = '#dc3545';
            button.style.borderColor = '#dc3545';
          };
          
          container.appendChild(button);
          return container;
        }
      }
    ];
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
    if (!this.currentClassId) {
      return;
    }
    
    this.loadTrackingCount();
    
    this.studentService.getListByClass(this.currentClassId).subscribe({
      next: (data: any) => {
        const students = this.extractData(data);
        
        this.studentList = students.map((student: any) => ({
          id: student.Id || student.id,
          code: student.Code || student.code || student.maHocSinh,
          fullName: student.FullName || student.fullName || student.hoTen,
          ...student
        }));
        
        if (this.studentList.length > 0 && !this.selectedStudent) {
          this.selectStudent(this.studentList[0]);
        }
      },
      error: (err) => {
        console.error('Error loading students:', err);
        notify('Không thể tải danh sách học sinh', 'error', 2000);
      }
    });
  }

  selectStudent(student: any) {
    this.selectedStudent = student;
    this.loadTrackingData();
  }

  loadTrackingData() {
    if (!this.selectedStudent) {
      return;
    }
    
    const period = this.selectedPeriod === 'all' ? undefined : this.selectedPeriod;
    
    this.studentTrackingService.getListByClass(
      this.currentClassId,
      this.currentSchoolYear,
      period
    ).subscribe({
      next: (data) => {
        const filteredData = data.filter((item: any) => 
          item.studentId === this.selectedStudent.id
        );
        
        this.rowData = filteredData.map((item: any) => ({
          id: item.id,
          period: item.moC_THOI_GIAN,
          issue: item.vaN_DE_QUAN_TAM,
          intervention: item.bieN_PHAP_CAN_THIEP,
          result: item.keT_QUA_SAU_CAN_THIEP,
          category: item.danH_MUC,
          priority: item.muC_DO_UU_TIEN,
          createdBy: item.teN_NGUOI_TAO,
          dateCreated: item.dateCreated,
          ...item
        }));
      },
      error: (err) => {
        console.error('Error loading tracking data:', err);
        notify('Không thể tải dữ liệu theo dõi', 'error', 2000);
      }
    });
  }

  loadTrackingCount() {
    if (!this.currentClassId) return;
    
    this.studentTrackingService.countByClass(
      this.currentClassId,
      this.currentSchoolYear
    ).subscribe({
      next: (count) => {
        this.trackingCount = count;
      },
      error: (err) => {
        console.error('Error loading count:', err);
      }
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    }, 100);
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    const data = event.data;
    
    if (data.isNew) {
      delete data.isNew;
      if (this.gridApi) {
        this.gridApi.refreshCells({ force: true });
      }
    }
    
    if (!data.dateCreated) {
      if (data.issue && data.issue.trim() !== '') {
        this.createTracking(data);
      }
    } else {
      this.updateTracking(data);
    }
  }

  onCellClicked(event: CellClickedEvent) {
    const target = event.event?.target as HTMLElement;
    
    if (target && target.closest('.btn-delete')) {
      const button = target.closest('button');
      const id = button?.getAttribute('data-id');
      
      if (id && id !== 'null' && id !== 'undefined') {
        this.deleteTracking(id);
      }
    }
  }

  addNewRow() {
    if (!this.selectedStudent) {
      notify('Vui lòng chọn học sinh', 'warning', 2000);
      return;
    }
    
    const newRow = {
      id: null,
      studentId: this.selectedStudent.id,
      period: this.selectedPeriod !== 'all' ? this.selectedPeriod : 'GIUA_KY_1',
      issue: '',
      intervention: '',
      result: '',
      category: 'academic',
      priority: 'medium',
      createdBy: '',
      dateCreated: null,
      isNew: true
    };
    
    this.rowData = [newRow, ...this.rowData];
    
    notify('Đã thêm dòng mới. Nhấp đúp vào ô để nhập thông tin', 'info', 3000);
    
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.ensureIndexVisible(0, 'top');
        this.gridApi.setFocusedCell(0, 'issue');
        this.gridApi.startEditingCell({
          rowIndex: 0,
          colKey: 'issue'
        });
      }
    }, 200);
  }

  createTracking(data: any) {
    if (!data.issue || data.issue.trim() === '') {
      notify('Vui lòng nhập vấn đề quan tâm', 'warning', 2000);
      return;
    }
    
    const payload = {
      ClassId: this.currentClassId,
      StudentId: this.selectedStudent.id,
      MA_NAM_HOC: this.currentSchoolYear,
      MOC_THOI_GIAN: data.period || 'GIUA_KY_1',
      VAN_DE_QUAN_TAM: data.issue,
      BIEN_PHAP_CAN_THIEP: data.intervention || '',
      KET_QUA_SAU_CAN_THIEP: data.result || '',
      DANH_MUC: data.category || 'academic',
      MUC_DO_UU_TIEN: data.priority || 'medium'
    };
    
    this.studentTrackingService.create(payload).subscribe({
      next: (response) => {
        notify(response.message || 'Tạo theo dõi thành công', 'success', 2000);
        this.loadTrackingData();
        this.loadTrackingCount();
      },
      error: (err) => {
        console.error('Create error:', err);
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi tạo theo dõi';
        notify(errorMessage, 'error', 3000);
        this.loadTrackingData();
      }
    });
  }

  updateTracking(data: any) {
    if (!data.issue || data.issue.trim() === '') {
      notify('Vui lòng nhập vấn đề quan tâm', 'warning', 2000);
      this.loadTrackingData();
      return;
    }
    
    const payload = {
      DateCreated: data.dateCreated,
      ClassId: this.currentClassId,
      StudentId: this.selectedStudent.id,
      MA_NAM_HOC: this.currentSchoolYear,
      MOC_THOI_GIAN: data.period || '',
      VAN_DE_QUAN_TAM: data.issue,
      BIEN_PHAP_CAN_THIEP: data.intervention || '',
      KET_QUA_SAU_CAN_THIEP: data.result || '',
      DANH_MUC: data.category || '',
      MUC_DO_UU_TIEN: data.priority || ''
    };
    
    this.studentTrackingService.update(payload).subscribe({
      next: (response) => {
        notify(response.message || 'Cập nhật thành công', 'success', 2000);
        this.loadTrackingData();
      },
      error: (err) => {
        console.error('Update error:', err);
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật';
        notify(errorMessage, 'error', 3000);
        this.loadTrackingData();
      }
    });
  }

  deleteTracking(id: string) {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    
    this.studentTrackingService.delete(id).subscribe({
      next: (response) => {
        notify(response.message || 'Xóa thành công', 'success', 2000);
        this.loadTrackingData();
        this.loadTrackingCount();
      },
      error: (err) => {
        console.error('Delete error:', err);
        const errorMessage = err.error?.message || 'Có lỗi xảy ra khi xóa';
        notify(errorMessage, 'error', 3000);
      }
    });
  }

  classChange(e: any) {
    this.filterClassId = e.itemData.id;
    this.currentClassId = e.itemData.id;
    this.selectedStudent = null;
    this.rowData = [];
    this.loadData();
  }

  periodChange(e: any) {
    this.selectedPeriod = e.itemData.value;
    this.loadTrackingData();
  }

  getPeriodText(value: string): string {
    if (!value) return '';
    const period = this.periodSource.find(p => p.value === value);
    return period ? period.name : value;
  }

  getCategoryText(value: string): string {
    if (!value) return '';
    const category = this.categorySource.find(c => c.value === value);
    return category ? category.name : value;
  }

  getPriorityText(value: string): string {
    if (!value) return '';
    const priority = this.prioritySource.find(p => p.value === value);
    return priority ? priority.name : value;
  }

  exportToExcel() {
    if (!this.gridApi) {
      notify('Grid chưa sẵn sàng', 'warning', 2000);
      return;
    }
    
    const params = {
      fileName: `Theo_doi_hoc_sinh_${this.selectedStudent?.fullName || 'all'}_${new Date().getTime()}.xlsx`,
      sheetName: 'Theo dõi học sinh',
      columnKeys: ['period', 'issue', 'intervention', 'result', 'category', 'priority', 'createdBy']
    };
    
    this.gridApi.exportDataAsExcel(params);
  }
}