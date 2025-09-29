import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-monthly-plan',
  templateUrl: './monthly-plan.component.html',
  styleUrls: ['./monthly-plan.component.scss']
})
export class MonthlyPlanComponent implements OnInit, AfterViewInit {
  monthlyPlanData: any[] = [];
  teacherJournalData: any[] = [];
  
  planCount = 0;
  journalCount = 0;

  monthlyTopic = '';
  monthlyFocus = '';
  selectedMonth = 9;
  selectedYear = 2024;
   splitterItems = [
    {
      size: '50%',
      collapsible: false,
      template: 'planTemplate'
    },
    {
      size: '50%',
      collapsible: false,
      template: 'journalTemplate'
    }
  ];
  monthSource = [
    { id: 1, name: 'Tháng 1', value: 1 },
    { id: 2, name: 'Tháng 2', value: 2 },
    { id: 3, name: 'Tháng 3', value: 3 },
    { id: 4, name: 'Tháng 4', value: 4 },
    { id: 5, name: 'Tháng 5', value: 5 },
    { id: 6, name: 'Tháng 6', value: 6 },
    { id: 7, name: 'Tháng 7', value: 7 },
    { id: 8, name: 'Tháng 8', value: 8 },
    { id: 9, name: 'Tháng 9', value: 9 },
    { id: 10, name: 'Tháng 10', value: 10 },
    { id: 11, name: 'Tháng 11', value: 11 },
    { id: 12, name: 'Tháng 12', value: 12 }
  ];

  yearSource = [
    { id: 2023, name: '2023', value: 2023 },
    { id: 2024, name: '2024', value: 2024 },
    { id: 2025, name: '2025', value: 2025 }
  ];

  exportTexts = {
    exportTo: 'Xuất ra',
    exportAll: 'Xuất tất cả dữ liệu',
    exportSelectedRows: 'Xuất hàng đã chọn'
  };

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Debug để kiểm tra splitter render
    setTimeout(() => {
      const splitter = document.querySelector('.dx-splitter');
      const items = document.querySelectorAll('.dx-splitter-item');
      console.log('✅ Splitter rendered:', splitter);
      console.log('✅ Splitter height:', splitter?.clientHeight);
      console.log('✅ Number of items:', items.length);
      items.forEach((item, index) => {
        console.log(`✅ Item ${index} height:`, item.clientHeight);
      });
    }, 500);
  }

  loadData(): void {
    // Thông tin chung của tháng
    this.monthlyTopic = 'KHAI GIẢNG NĂM HỌC MỚI';
    this.monthlyFocus = 'Khai giảng năm học - Ổn định tổ đội lớp 5';
    
    // Dữ liệu bảng kế hoạch
    this.monthlyPlanData = [
      {
        stt: 1,
        timeFrom: '5/9',
        timeTo: '9/9',
        content: 'Làm quen lớp 5, ổn định tổ đội lớp học, tuyên truyền thực hiện quy định lớp 5',
        evaluation: 'Hoàn thành'
      },
      {
        stt: 2,
        timeFrom: '12/9',
        timeTo: '16/9', 
        content: 'Bình chọn ban cán sự lớp, xây dựng nội quy lớp học',
        evaluation: 'Đạt yêu cầu'
      },
      {
        stt: 3,
        timeFrom: '19/9',
        timeTo: '23/9',
        content: 'Tổ chức hoạt động ngoại khóa đầu năm học',
        evaluation: 'Chưa thực hiện'
      }
    ];
    this.planCount = this.monthlyPlanData.length;

    // Dữ liệu nhật ký
    this.teacherJournalData = [
      {
        stt: 1,
        date: new Date(2024, 8, 5),
        content: 'Họp lớp đầu năm, tham dự lễ khai giảng. Phát đồng phục, mũ cho học sinh. Được gặp các bạn sau 3 tháng hè và năng lượng năm học mới.'
      },
      {
        stt: 2,
        date: new Date(2024, 8, 16),
        content: 'Lớp cùng xây dựng bộ Nội quy riêng của lớp. Các bạn học "thích đó": có nội quy và tự giác sẽ thực hiện tốt nội quy'
      },
      {
        stt: 3,
        date: new Date(2024, 8, 20),
        content: 'Tổ chức sinh nhật tập thể cho các bạn sinh tháng 9. Không khí vui vẻ, ấm cúng.'
      }
    ];
    this.journalCount = this.teacherJournalData.length;
  }

  monthChange(event: any): void {
    this.selectedMonth = event.itemData.value;
    console.log('Month changed to:', this.selectedMonth);
    this.loadData();
  }

  yearChange(event: any): void {
    this.selectedYear = event.itemData.value;
    console.log('Year changed to:', this.selectedYear);
    this.loadData();
  }

  onPlanExporting(event: any): void {
    console.log('📊 Exporting monthly plan data');
  }

  onJournalExporting(event: any): void {
    console.log('📊 Exporting journal data');
  }

  onPlanRowUpdating(event: any): void {
    console.log('✏️ Updating plan row:', event);
  }

  onPlanRowInserting(event: any): void {
    event.data.stt = this.monthlyPlanData.length + 1;
    this.planCount++;
    console.log('➕ Inserting plan row:', event.data);
  }

  onPlanRowRemoving(event: any): void {
    this.planCount--;
    console.log('🗑️ Removing plan row:', event.data);
  }

  onJournalRowUpdating(event: any): void {
    console.log('✏️ Updating journal row:', event);
  }

  onJournalRowInserting(event: any): void {
    event.data.stt = this.teacherJournalData.length + 1;
    this.journalCount++;
    console.log('➕ Inserting journal row:', event.data);
  }

  onJournalRowRemoving(event: any): void {
    this.journalCount--;
    console.log('🗑️ Removing journal row:', event.data);
  }
}