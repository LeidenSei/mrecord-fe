import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services';
import { GeneralService } from '../../../services/general.service';
import { 
  ColDef, 
  GridApi, 
  GridReadyEvent, 
  CellClickedEvent,
  CellEditingStoppedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community';

export interface Student {
  id: number;
  stt: number;
  name: string;
  selected: boolean;
  subjectComment: string;
  regularComment: string;
  abilityComment: string;
  qualityComment: string;
  status: 'not-sent' | 'sent' | 'active'; 
}

export interface PresetComment {
  id: number;
  type: 'subject' | 'regular' | 'ability' | 'quality';
  text: string;
  category: string;
}
@Component({
  selector: 'app-one-period',
  templateUrl: './one-period.component.html',
  styleUrls: ['./one-period.component.scss']
})
export class OnePeriodComponent implements OnInit {
  selectedClass: string = '5B';
  selectedMonth: string = '7/2025';
  studentList: Student[] = [];
  gridApi!: GridApi;
  gridContext: any;
  loading: boolean = false;
  userData: any;
  showImportDropdown: boolean = false;
  showCommentModal: boolean = false;
  currentStudentIndex: number = -1;
  currentFieldType: 'subject' | 'regular' | 'ability' | 'quality' = 'subject';
  presetComments: PresetComment[] = [];
  filteredComments: PresetComment[] = [];
  searchText: string = '';

// Thay thế columnDefs hiện tại
columnDefs: ColDef[] = [
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    width: 50,
    pinned: 'left',
    headerName: '',
    suppressHeaderMenuButton: true,
    sortable: false,
    filter: false,
    resizable: false
  },
  {
    field: 'stt',
    headerName: 'STT',
    width: 60,
    cellStyle: { textAlign: 'center', fontWeight: 'bold', color: '#495057' },
    editable: false,
    suppressHeaderMenuButton: true,
    sortable: false,
    filter: false,
    resizable: false
  },
  {
    field: 'name',
    headerName: 'Tên học sinh',
    width: 190,
    cellStyle: { fontWeight: 'bold', color: '#333', paddingLeft: '12px' },
    editable: false,
    suppressHeaderMenuButton: true,
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    field: 'subjectComment',
    headerName: 'Môn học và hoạt động giáo dục',
    width: 350,
    cellRenderer: (params: any) => {
      const value = params.value || '';
      const rowIndex = params.node.rowIndex;
      return `
        <div class="comment-cell-wrapper">
          <input class="comment-cell-input" value="${value}" 
                 onchange="window.updateComment(${rowIndex}, 'subjectComment', this.value)"
                 placeholder="Nhập nhận xét môn học...">
          <button class="comment-modal-btn" 
                  onclick="window.openCommentModal(${rowIndex}, 'subjectComment')"
                  title="Chọn nhận xét có sẵn">📝</button>
        </div>
      `;
    },
    suppressHeaderMenuButton: true,
    sortable: false,
    filter: false
  },
  {
    field: 'regularComment',
    headerName: 'Nhận xét năng lực chung',
    width: 300,
    cellRenderer: (params: any) => {
      const value = params.value || '';
      const rowIndex = params.node.rowIndex;
      return `
        <div class="comment-cell-wrapper">
          <input class="comment-cell-input" value="${value}" 
                 onchange="window.updateComment(${rowIndex}, 'regularComment', this.value)"
                 placeholder="Nhận xét năng lực...">
          <button class="comment-modal-btn" 
                  onclick="window.openCommentModal(${rowIndex}, 'regularComment')"
                  title="Chọn nhận xét có sẵn">📝</button>
        </div>
      `;
    },
    suppressHeaderMenuButton: true,
    sortable: false,
    filter: false
  },
  {
    field: 'abilityComment',
    headerName: 'Năng lực đặc thù',
    width: 300,
    cellRenderer: (params: any) => {
      const value = params.value || '';
      const rowIndex = params.node.rowIndex;
      return `
        <div class="comment-cell-wrapper">
          <input class="comment-cell-input" value="${value}" 
                 onchange="window.updateComment(${rowIndex}, 'abilityComment', this.value)"
                 placeholder="Năng lực đặc thù...">
          <button class="comment-modal-btn" 
                  onclick="window.openCommentModal(${rowIndex}, 'abilityComment')"
                  title="Chọn nhận xét có sẵn">📝</button>
        </div>
      `;
    },
    suppressHeaderMenuButton: true,
    sortable: false,
    filter: false
  },
  {
    field: 'qualityComment',
    headerName: 'Nhận xét phẩm chất chủ yếu',
    width: 300,
    cellRenderer: (params: any) => {
      const value = params.value || '';
      const rowIndex = params.node.rowIndex;
      return `
        <div class="comment-cell-wrapper">
          <input class="comment-cell-input" value="${value}" 
                 onchange="window.updateComment(${rowIndex}, 'qualityComment', this.value)"
                 placeholder="Nhận xét phẩm chất...">
          <button class="comment-modal-btn" 
                  onclick="window.openCommentModal(${rowIndex}, 'qualityComment')"
                  title="Chọn nhận xét có sẵn">📝</button>
        </div>
      `;
    },
    suppressHeaderMenuButton: true,
    sortable: false,
    filter: false
  }
];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: false,
    filter: false,
    editable: false,
    suppressHeaderMenuButton: true
  };

  rowSelection: 'single' | 'multiple' = 'multiple';

  getContextMenuItems = (params: any) => {
    const fieldName = params.column?.getColId();
    
    if (fieldName && fieldName.includes('Comment')) {
      return [
        {
          name: 'Chọn nhận xét có sẵn',
          icon: '<span style="color: #007bff;">📝</span>',
          action: () => {
            this.openCommentModal(params.node.rowIndex, fieldName);
          }
        },
        {
          name: 'Xóa nhận xét',
          icon: '<span style="color: #dc3545;">🗑️</span>',
          action: () => {
            params.node.setDataValue(fieldName, '');
          }
        },
        'separator',
        {
          name: 'Sao chép',
          icon: '<span>📋</span>',
          action: () => {
            navigator.clipboard.writeText(params.value || '');
          }
        },
        {
          name: 'Dán',
          icon: '<span>📄</span>',
          action: () => {
            navigator.clipboard.readText().then(text => {
              params.node.setDataValue(fieldName, text);
            });
          }
        }
      ];
    }
    
    return [
      'copy',
      'paste',
      'separator',
      'export'
    ];
  };

  constructor(
    private authService: AuthService,
    private generalService: GeneralService
  ) {
    this.gridContext = {
      componentParent: this
    };
  }

async ngOnInit() {
  this.userData = await this.authService.getUser();
  await this.loadStudentData();
  this.loadPresetComments();
  
  // Expose functions to window
  (window as any).openCommentModal = (rowIndex: number, fieldType: string) => {
    this.openCommentModal(rowIndex, fieldType);
  };
  
  (window as any).updateComment = (rowIndex: number, fieldType: string, value: string) => {
    const student = this.studentList[rowIndex];
    if (student) {
      student[fieldType] = value;
    }
  };
}

  async loadStudentData() {
    try {
      this.loading = true;
      this.studentList = [
        {
          id: 1,
          stt: 1,
          name: 'Nguyễn Xuân Trường',
          selected: false,
          subjectComment: '',
          regularComment: '',
          abilityComment: '',
          qualityComment: '',
          status: 'not-sent'
        },
        {
          id: 2,
          stt: 2,
          name: 'Nguyễn Lam Anh',
          selected: false,
          subjectComment: 'Em có khả năng tiếp thu tốt các môn học',
          regularComment: 'Năng lực chung ở mức khá',
          abilityComment: 'Đặc biệt giỏi môn Toán',
          qualityComment: 'Em có ý thức học tập tốt',
          status: 'sent'
        },
        {
          id: 3,
          stt: 3,
          name: 'Nguyễn Tùng Lâm',
          selected: false,
          subjectComment: 'Cần cố gắng hơn trong các môn học',
          regularComment: 'Năng lực chung trung bình',
          abilityComment: 'Yêu thích môn Thể dục',
          qualityComment: 'Em cần rèn luyện thêm tính kiên trì',
          status: 'active'
        },
        {
          id: 4,
          stt: 4,
          name: 'Nguyễn Hoàng Trúc Linh',
          selected: false,
          subjectComment: 'Em học tập chăm chỉ và có tiến bộ',
          regularComment: 'Năng lực chung tốt',
          abilityComment: 'Giỏi môn Văn và Sử',
          qualityComment: 'Em có phẩm chất tốt, thân thiện với bạn bè',
          status: 'sent'
        }
      ];
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      this.loading = false;
    }
  }

  loadPresetComments() {
    this.presetComments = [
      { id: 1, type: 'subject', text: 'Em có khả năng tiếp thu tốt các môn học', category: 'Tích cực' },
      { id: 2, type: 'subject', text: 'Em học tập chăm chỉ và có tiến bộ rõ rệt', category: 'Tích cực' },
      { id: 3, type: 'subject', text: 'Em tham gia tích cực các hoạt động học tập', category: 'Tích cực' },
      { id: 4, type: 'subject', text: 'Cần cố gắng hơn trong các môn học', category: 'Cần cải thiện' },
      { id: 5, type: 'subject', text: 'Em cần chú ý hơn trong giờ học', category: 'Cần cải thiện' },
      { id: 6, type: 'regular', text: 'Năng lực chung ở mức tốt', category: 'Tích cực' },
      { id: 7, type: 'regular', text: 'Năng lực chung ở mức khá', category: 'Tích cực' },
      { id: 8, type: 'regular', text: 'Năng lực chung trung bình', category: 'Trung bình' },
      { id: 9, type: 'regular', text: 'Năng lực chung cần được nâng cao', category: 'Cần cải thiện' },
      { id: 10, type: 'ability', text: 'Đặc biệt giỏi môn Toán', category: 'Điểm mạnh' },
      { id: 11, type: 'ability', text: 'Giỏi môn Văn và Sử', category: 'Điểm mạnh' },
      { id: 12, type: 'ability', text: 'Yêu thích môn Thể dục', category: 'Sở thích' },
      { id: 13, type: 'ability', text: 'Có năng khiếu nghệ thuật', category: 'Điểm mạnh' },
      { id: 14, type: 'quality', text: 'Em có ý thức học tập tốt', category: 'Tích cực' },
      { id: 15, type: 'quality', text: 'Em có phẩm chất tốt, thân thiện với bạn bè', category: 'Tích cực' },
      { id: 16, type: 'quality', text: 'Em cần rèn luyện thêm tính kiên trì', category: 'Cần cải thiện' },
      { id: 17, type: 'quality', text: 'Em có tinh thần trách nhiệm cao', category: 'Tích cực' }
    ];
    this.filteredComments = this.presetComments;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onCellClicked(event: CellClickedEvent) {
    console.log('Cell clicked:', event);
  }

  onCellEditingStopped(event: CellEditingStoppedEvent) {
    console.log('Cell editing stopped:', event);
    const student = this.studentList.find(s => s.id === event.data.id);
    if (student && event.column) {
      const field = event.column.getColId();
      student[field] = event.newValue;
    }
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedIds = selectedNodes.map(node => node.data.id);
    
    this.studentList.forEach(student => {
      student.selected = selectedIds.includes(student.id);
    });
  }

  onClassChanged() {
    this.loadStudentData();
  }

  onMonthChanged() {
    this.loadStudentData();
  }

  openCommentModal(studentIndex: number, fieldType: string) {
    this.currentStudentIndex = studentIndex;
    const fieldTypeMap = {
      'subjectComment': 'subject',
      'regularComment': 'regular', 
      'abilityComment': 'ability',
      'qualityComment': 'quality'
    };
    
    this.currentFieldType = fieldTypeMap[fieldType] as 'subject' | 'regular' | 'ability' | 'quality';
    this.showCommentModal = true;
    this.searchText = '';
    this.filterComments();
  }

  filterComments() {
    this.filteredComments = this.presetComments.filter(comment => {
      const matchesType = comment.type === this.currentFieldType;
      const matchesSearch = this.searchText === '' || 
        comment.text.toLowerCase().includes(this.searchText.toLowerCase()) ||
        comment.category.toLowerCase().includes(this.searchText.toLowerCase());
      return matchesType && matchesSearch;
    });
  }

  selectComment(comment: PresetComment) {
    if (this.currentStudentIndex >= 0) {
      const student = this.studentList[this.currentStudentIndex];
      const fieldMap = {
        'subject': 'subjectComment',
        'regular': 'regularComment',
        'ability': 'abilityComment',
        'quality': 'qualityComment'
      };
      
      const fieldName = fieldMap[this.currentFieldType];
      if (fieldName) {
        student[fieldName] = comment.text;
        this.gridApi.refreshCells({
          rowNodes: [this.gridApi.getRowNode(this.currentStudentIndex.toString())],
          columns: [fieldName]
        });
      }
    }
    this.showCommentModal = false;
  }

  closeCommentModal() {
    this.showCommentModal = false;
  }

  sendNotification() {
    const selectedStudents = this.studentList.filter(s => s.selected);
    if (selectedStudents.length === 0) {
      alert('Vui lòng chọn ít nhất một học sinh để gửi thông tin!');
      return;
    }
    
    console.log('Sending notifications to:', selectedStudents);
    alert(`Đã gửi thông tin đến ${selectedStudents.length} học sinh!`);
    selectedStudents.forEach(student => {
      student.status = 'sent';
      student.selected = false;
    });
    
    this.gridApi.deselectAll();
    this.gridApi.refreshCells();
  }

  generateTemplate() {
    alert('Đã tạo mẫu nhận xét thành công!');
  }

  saveComments() {
    const selectedStudents = this.studentList.filter(s => s.selected);
    const hasEmptyComments = selectedStudents.some(student => 
      !student.subjectComment.trim()
    );
    
    if (hasEmptyComments) {
      alert('Vui lòng điền đầy đủ nhận xét cho các học sinh đã chọn!');
      return;
    }

    const dataToSave = this.studentList.map(student => ({
      id: student.id,
      name: student.name,
      comments: {
        subject: student.subjectComment,
        regular: student.regularComment,
        ability: student.abilityComment,
        quality: student.qualityComment
      },
      class: this.selectedClass,
      month: this.selectedMonth
    }));
    
    console.log('Data to save:', dataToSave);
    setTimeout(() => {
      alert('Đã lưu nhận xét thành công!');
    }, 500);
  }

  toggleImportDropdown() {
    this.showImportDropdown = !this.showImportDropdown;
  }

  getUniqueCategories(comments: PresetComment[]): string[] {
    const categories = comments.map(comment => comment.category);
    return [...new Set(categories)];
  }

  getCommentsByCategory(comments: PresetComment[], category: string): PresetComment[] {
    return comments.filter(comment => comment.category === category);
  }
  ngOnDestroy() {
    delete (window as any).openCommentModal;
    delete (window as any).updateComment;
  }
}