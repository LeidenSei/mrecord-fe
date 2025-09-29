import { Component, OnInit } from '@angular/core';

interface GoodDeed {
  id?: number;
  stt: number;
  date: Date;
  studentName: string;
  category: string;
  title: string;
  level: string;
  recognizedBy: string;
}

@Component({
  selector: 'app-good-deeds',
  templateUrl: './good-deeds.component.html',
  styleUrls: ['./good-deeds.component.scss']
})
export class GoodDeedsComponent implements OnInit {
  datas: GoodDeed[] = [];
  goodDeedsCount = 0;
  
  // Filter data
  gradeSource = ['Tất cả', 'Khối 1', 'Khối 2', 'Khối 3', 'Khối 4', 'Khối 5'];
  filterClassSource: any[] = [];
  filterClassId: any = null;
  
  categoryFilterSource = [
    { value: '', name: 'Tất cả loại' },
    { value: 'learning', name: 'Học tập' },
    { value: 'discipline', name: 'Kỷ luật' },
    { value: 'environment', name: 'Môi trường' },
    { value: 'helping', name: 'Giúp đỡ' },
    { value: 'community', name: 'Cộng đồng' },
    { value: 'talent', name: 'Tài năng' }
  ];
  selectedCategoryFilter = '';
  
  // Lookup data - removed emoji icons
  studentSource: any[] = [];
  categorySource = [
    { value: 'learning', name: 'Học tập' },
    { value: 'discipline', name: 'Kỷ luật' },
    { value: 'environment', name: 'Môi trường' },
    { value: 'helping', name: 'Giúp đỡ bạn bè' },
    { value: 'community', name: 'Hoạt động cộng đồng' },
    { value: 'talent', name: 'Tài năng đặc biệt' }
  ];
  
  levelSource = [
    { value: 'class', name: 'Cấp lớp' },
    { value: 'school', name: 'Cấp trường' },
    { value: 'district', name: 'Cấp huyện' },
    { value: 'city', name: 'Cấp thành phố' }
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
    this.loadGoodDeedsData();
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

  loadGoodDeedsData(): void {
    this.datas = [
      {
        id: 1,
        stt: 1,
        date: new Date('2024-09-15'),
        studentName: 'Nguyễn Văn An',
        category: 'learning',
        title: 'Đạt điểm 10 môn Toán liên tiếp 3 bài kiểm tra',
        level: 'class',
        recognizedBy: 'Cô Nguyễn Thị Lan'
      },
      {
        id: 2,
        stt: 2,
        date: new Date('2024-09-18'),
        studentName: 'Trần Thị Bình',
        category: 'helping',
        title: 'Giúp đỡ bạn học yếu môn Tiếng Anh',
        level: 'class',
        recognizedBy: 'Thầy Trần Văn Nam'
      },
      {
        id: 3,
        stt: 3,
        date: new Date('2024-09-20'),
        studentName: 'Lê Văn Cường',
        category: 'environment',
        title: 'Dọn vệ sinh sân trường không được phân công',
        level: 'school',
        recognizedBy: 'Thầy Phạm Văn Đức'
      },
      {
        id: 4,
        stt: 4,
        date: new Date('2024-09-22'),
        studentName: 'Phạm Thị Dung',
        category: 'community',
        title: 'Tham gia hoạt động từ thiện cho trẻ em vùng cao',
        level: 'district',
        recognizedBy: 'Cô Lê Thị Mai'
      },
      {
        id: 5,
        stt: 5,
        date: new Date('2024-09-25'),
        studentName: 'Hoàng Văn Em',
        category: 'talent',
        title: 'Đạt giải nhất cuộc thi vẽ tranh cấp trường',
        level: 'school',
        recognizedBy: 'Thầy Đỗ Văn Nam'
      }
    ];
    
    this.goodDeedsCount = this.datas.length;
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

  onExporting(event: any): void {
    console.log('Exporting data');
  }

  onRowUpdating(event: any): void {
    console.log('Updating row:', event);
  }

  onRowInserting(event: any): void {
    console.log('Inserting row:', event);
    event.data.stt = this.datas.length + 1;
    event.data.recognizedBy = event.data.recognizedBy || 'Giáo viên chủ nhiệm';
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
      'learning': 'category-learning',
      'discipline': 'category-discipline', 
      'environment': 'category-environment',
      'helping': 'category-helping',
      'community': 'category-community',
      'talent': 'category-talent'
    };
    return classes[category as keyof typeof classes] || '';
  }

  getLevelText(level: string): string {
    const lvl = this.levelSource.find(l => l.value === level);
    return lvl ? lvl.name : level;
  }

  getLevelClass(level: string): string {
    const classes = {
      'class': 'level-class',
      'school': 'level-school',
      'district': 'level-district',
      'city': 'level-city'
    };
    return classes[level as keyof typeof classes] || '';
  }
}