import { Component, OnInit } from '@angular/core';

interface GoodDeed {
  id?: number;
  stt: number;
  date: Date;
  studentName: string;
  title: string;
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
  
  studentSource: any[] = [];
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
        title: 'Đạt điểm 10 môn Toán liên tiếp 3 bài kiểm tra',
        recognizedBy: 'Cô Nguyễn Thị Lan'
      },
      {
        id: 2,
        stt: 2,
        date: new Date('2024-09-18'),
        studentName: 'Trần Thị Bình',
        title: 'Giúp đỡ bạn học yếu môn Tiếng Anh',
        recognizedBy: 'Thầy Trần Văn Nam'
      },
      {
        id: 3,
        stt: 3,
        date: new Date('2024-09-20'),
        studentName: 'Lê Văn Cường',
        title: 'Dọn vệ sinh sân trường không được phân công',
        recognizedBy: 'Thầy Phạm Văn Đức'
      },
      {
        id: 4,
        stt: 4,
        date: new Date('2024-09-22'),
        studentName: 'Phạm Thị Dung',
        title: 'Tham gia hoạt động từ thiện cho trẻ em vùng cao',
        recognizedBy: 'Cô Lê Thị Mai'
      },
      {
        id: 5,
        stt: 5,
        date: new Date('2024-09-25'),
        studentName: 'Hoàng Văn Em',
        title: 'Đạt giải nhất cuộc thi vẽ tranh cấp trường',
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

  getLevelText(level: string): string {
    const lvl = this.levelSource.find(l => l.value === level);
    return lvl ? lvl.name : level;
  }

}