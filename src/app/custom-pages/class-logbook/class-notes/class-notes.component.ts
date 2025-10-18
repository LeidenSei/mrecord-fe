import { Component, OnInit } from '@angular/core';

interface ClassNote {
  id?: number;
  stt: number;
  date: Date;
  category: string;
  priority: string;
  title: string;
  content: string;
  studentName?: string;
  actionRequired?: string;
  status: string;
  followUpDate?: Date;
  createdBy: string;
}

@Component({
  selector: 'app-class-notes',
  templateUrl: './class-notes.component.html',
  styleUrls: ['./class-notes.component.scss']
})
export class ClassNotesComponent implements OnInit {
  datas: ClassNote[] = [];
  notesCount = 0;
  gradeSource = ['Tất cả', 'Khối 1', 'Khối 2', 'Khối 3', 'Khối 4',  'Khối 5'];
  filterClassSource: any[] = [];
  filterClassId: any = null;
  
  selectedCategoryFilter = '';
  
  priorityFilterSource = [
    { value: '', name: 'Tất cả mức độ' },
    { value: 'high', name: 'Cao' },
    { value: 'medium', name: 'Trung bình' },
    { value: 'low', name: 'Thấp' }
  ];
  selectedPriorityFilter = '';
  
  // Lookup data
  studentSource: any[] = [];
  categorySource = [
    { value: 'student_behavior', name: 'Hành vi học sinh' },
    { value: 'academic', name: 'Học tập' },
    { value: 'health', name: 'Sức khỏe' },
    { value: 'family', name: 'Gia đình' },
    { value: 'class_management', name: 'Quản lý lớp' },
    { value: 'facility', name: 'Cơ sở vật chất' }
  ];
  
  prioritySource = [
    { value: 'high', name: 'Cao' },
    { value: 'medium', name: 'Trung bình' },
    { value: 'low', name: 'Thấp' }
  ];

  statusSource = [
    { value: 'new', name: 'Mới' },
    { value: 'in_progress', name: 'Đang xử lý' },
    { value: 'resolved', name: 'Đã giải quyết' },
    { value: 'monitoring', name: 'Theo dõi' }
  ];

  exportTexts = {
    exportAll: 'Xuất toàn bộ',
    exportSelectedRows: 'Xuất dòng được chọn',
    exportTo: 'Xuất ra'
  };

  constructor() { }

  ngOnInit(): void {
    this.loadClassData();
    this.loadStudentData();
    this.loadNotesData();
  }

  loadClassData(): void {
    this.filterClassSource = [
      { id: null, name: 'Tất cả lớp' },
      { id: 1, name: '6A1' },
      { id: 2, name: '6A2' },
      { id: 3, name: '7A1' },
      { id: 4, name: '7A2' }
    ];
    this.filterClassId = null;
  }

  loadStudentData(): void {
    this.studentSource = [
      { id: 1, fullName: 'Nguyễn Văn An', className: '6A1' },
      { id: 2, fullName: 'Trần Thị Bình', className: '6A1' },
      { id: 3, fullName: 'Lê Văn Cường', className: '6A1' },
      { id: 4, fullName: 'Phạm Thị Dung', className: '6A1' },
      { id: 5, fullName: 'Hoàng Văn Em', className: '6A1' }
    ];
  }

  loadNotesData(): void {
    this.datas = [
      {
        id: 1,
        stt: 1,
        date: new Date('2024-09-01'),
        category: 'student_behavior',
        priority: 'high',
        title: 'Học sinh Nguyễn Văn An có khuynh hướng bạo lực',
        content: 'Em thường xuyên đánh bạn trong giờ ra chơi, cần được theo dõi sát sao và có biện pháp can thiệp kịp thời',
        studentName: 'Nguyễn Văn An',
        actionRequired: 'Gặp phụ huynh, lập kế hoạch can thiệp hành vi',
        status: 'in_progress',
        followUpDate: new Date('2024-10-01'),
        createdBy: 'Cô Nguyễn Thị Lan'
      },
      {
        id: 2,
        stt: 2,
        date: new Date('2024-09-02'),
        category: 'health',
        priority: 'medium',
        title: 'Trần Thị Bình có vấn đề về thị lực',
        content: 'Em thường xuyên nheo mắt khi nhìn bảng, nghi ngờ cận thị, cần kiểm tra mắt',
        studentName: 'Trần Thị Bình',
        actionRequired: 'Thông báo phụ huynh đưa đi khám mắt',
        status: 'resolved',
        followUpDate: new Date('2024-09-15'),
        createdBy: 'Thầy Trần Văn Nam'
      },
      {
        id: 3,
        stt: 3,
        date: new Date('2024-09-03'),
        category: 'family',
        priority: 'high',
        title: 'Hoàn cảnh gia đình Lê Văn Cường khó khăn',
        content: 'Bố mẹ em ly hôn, hiện sống với bà ngoại già yếu. Em thường xuyên buồn bã, cần được quan tâm đặc biệt',
        studentName: 'Lê Văn Cường',
        actionRequired: 'Tạo điều kiện hỗ trợ học phí, động viên tinh thần',
        status: 'monitoring',
        followUpDate: new Date('2024-12-01'),
        createdBy: 'Cô Lê Thị Mai'
      },
      {
        id: 4,
        stt: 4,
        date: new Date('2024-09-05'),
        category: 'class_management',
        priority: 'medium',
        title: 'Tổ chức lại chỗ ngồi để tăng hiệu quả học tập',
        content: 'Cần sắp xếp lại chỗ ngồi để những học sinh yếu ngồi gần bàn giáo viên, học sinh giỏi ngồi xen kẽ để hỗ trợ',
        actionRequired: 'Lập sơ đồ chỗ ngồi mới và thông báo học sinh',
        status: 'resolved',
        createdBy: 'Thầy Phạm Văn Đức'
      },
      {
        id: 5,
        stt: 5,
        date: new Date('2024-09-07'),
        category: 'facility',
        priority: 'low',
        title: 'Cần sửa chữa bàn ghế hỏng trong lớp',
        content: 'Có 3 bộ bàn ghế bị gãy chân, cần thông báo bộ phận hậu cần sửa chữa',
        actionRequired: 'Gửi đơn yêu cầu sửa chữa lên phòng hậu cần',
        status: 'new',
        followUpDate: new Date('2024-09-20'),
        createdBy: 'Cô Hoàng Thị Nga'
      }
    ];
    
    this.notesCount = this.datas.length;
  }

  gradeChange(event: any): void {
    console.log('Grade changed:', event);
  }

  classChange(event: any): void {
    this.filterClassId = event.itemData.id;
    console.log('Class changed:', event.itemData);
  }

  categoryFilterChange(event: any): void {
    this.selectedCategoryFilter = event.itemData.value;
    console.log('Category filter changed:', event.itemData);
  }

  priorityFilterChange(event: any): void {
    this.selectedPriorityFilter = event.itemData.value;
    console.log('Priority filter changed:', event.itemData);
  }

  onExporting(event: any): void {
    console.log('Exporting data');
  }

  onRowUpdating(event: any): void {
    console.log('Updating row:', event);
  }

  onRowInserting(event: any): void {
    console.log('Inserting row:', event);
    event.data.stt = this.datas.length + 1;
    event.data.status = event.data.status || 'new';
    event.data.createdBy = event.data.createdBy || 'Giáo viên chủ nhiệm';
  }

  onRowRemoving(event: any): void {
    console.log('Removing row:', event);
  }

  getCategoryText(category: string): string {
    const cat = this.categorySource.find(c => c.value === category);
    return cat ? cat.name : category;
  }

  getCategoryClass(category: string): string {
    const classes = {
      'student_behavior': 'category-behavior',
      'academic': 'category-academic',
      'health': 'category-health',
      'family': 'category-family',
      'class_management': 'category-management',
      'facility': 'category-facility'
    };
    return classes[category as keyof typeof classes] || '';
  }

  getPriorityText(priority: string): string {
    const pri = this.prioritySource.find(p => p.value === priority);
    return pri ? pri.name : priority;
  }

  getPriorityClass(priority: string): string {
    const classes = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return classes[priority as keyof typeof classes] || '';
  }

  getStatusText(status: string): string {
    const stat = this.statusSource.find(s => s.value === status);
    return stat ? stat.name : status;
  }

  getStatusClass(status: string): string {
    const classes = {
      'new': 'status-new',
      'in_progress': 'status-progress',
      'resolved': 'status-resolved',
      'monitoring': 'status-monitoring'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getFollowUpClass(date: Date): string {
    if (!date) return '';
    
    const today = new Date();
    const followUp = new Date(date);
    const diffDays = Math.ceil((followUp.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return 'followup-overdue';
    if (diffDays <= 7) return 'followup-soon';
    return 'followup-normal';
  }
}