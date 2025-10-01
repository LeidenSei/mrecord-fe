import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-midterm-assessment',
  templateUrl: './midterm-assessment.component.html',
  styleUrls: ['./midterm-assessment.component.scss']
})
export class MidtermAssessmentComponent implements OnInit {
  gradeSource = ['Tất cả', 'Khối 1', 'Khối 2', 'Khối 3', 'Khối 4', 'Khối 5'];
  filterClassSource = [
    { id: 0, name: 'Tất cả' },
    { id: 1, name: '1A' },
    { id: 2, name: '1B' },
    { id: 3, name: '2A' },
    { id: 4, name: '2B' }
  ];
  filterClassId = 0;
  totalStudents = 48; // Tổng số học sinh
  exportTexts = {
    exportAll: 'Xuất dữ liệu excel',
    exportSelectedRows: 'Xuất các dòng đã chọn',
    exportTo: 'Xuất dữ liệu',
  };
  studentCount = 48; 
  subjectsGridOptions: GridOptions;
  qualitiesGridOptions: GridOptions;
  competenciesGridOptions: GridOptions;

  // Dữ liệu môn học - mỗi hàng là 1 môn
  subjectsData = [
    { stt: 1, subject: 'Tiếng Việt', htt: 47, httPercent: '97.9%', ht: 1, htPercent: '2.1%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 2, subject: 'Toán', htt: 47, httPercent: '97.9%', ht: 1, htPercent: '2.1%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 3, subject: 'Ngoại ngữ 1', htt: 46, httPercent: '95.8%', ht: 2, htPercent: '4.2%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 4, subject: 'Ngoại ngữ 2', htt: 45, httPercent: '93.8%', ht: 3, htPercent: '6.2%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 5, subject: 'Lịch sử và Địa lí', htt: 46, httPercent: '95.8%', ht: 2, htPercent: '4.2%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 6, subject: 'Khoa học', htt: 47, httPercent: '97.9%', ht: 1, htPercent: '2.1%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 7, subject: 'Tin học', htt: 46, httPercent: '95.8%', ht: 2, htPercent: '4.2%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 8, subject: 'Công nghệ', htt: 47, httPercent: '97.9%', ht: 1, htPercent: '2.1%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 9, subject: 'Đạo đức', htt: 48, httPercent: '100%', ht: 0, htPercent: '0%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 10, subject: 'Giáo dục thể chất', htt: 47, httPercent: '97.9%', ht: 1, htPercent: '2.1%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 11, subject: 'Nghệ thuật (Âm nhạc)', htt: 46, httPercent: '95.8%', ht: 2, htPercent: '4.2%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 12, subject: 'Nghệ thuật (Mỹ thuật)', htt: 47, httPercent: '97.9%', ht: 1, htPercent: '2.1%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 13, subject: 'Hoạt động trải nghiệm', htt: 46, httPercent: '95.8%', ht: 2, htPercent: '4.2%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' },
    { stt: 14, subject: 'Tiếng dân tộc', htt: 45, httPercent: '93.8%', ht: 3, htPercent: '6.2%', cht: 0, chtPercent: '0%', duoi5: 0, duoi5Percent: '0%', tren5: 48, tren5Percent: '100%' }
  ];

  // Dữ liệu phẩm chất - mỗi hàng là 1 phẩm chất
  qualitiesData = [
    { stt: 1, quality: 'Yêu nước', tot: 48, totPercent: '100%', dat: 0, datPercent: '0%', ccg: 0, ccgPercent: '0%' },
    { stt: 2, quality: 'Nhân ái', tot: 46, totPercent: '95.8%', dat: 2, datPercent: '4.2%', ccg: 0, ccgPercent: '0%' },
    { stt: 3, quality: 'Chăm chỉ', tot: 47, totPercent: '97.9%', dat: 1, datPercent: '2.1%', ccg: 0, ccgPercent: '0%' },
    { stt: 4, quality: 'Trung thực', tot: 48, totPercent: '100%', dat: 0, datPercent: '0%', ccg: 0, ccgPercent: '0%' },
    { stt: 5, quality: 'Trách nhiệm', tot: 46, totPercent: '95.8%', dat: 2, datPercent: '4.2%', ccg: 0, ccgPercent: '0%' }
  ];

  // Dữ liệu năng lực - mỗi hàng là 1 năng lực
  competenciesData = [
    { stt: 1, competency: 'Tự chủ và tự học', dat: 48, datPercent: '100%', ccg: 0, ccgPercent: '0%' },
    { stt: 2, competency: 'Giao tiếp và hợp tác', dat: 48, datPercent: '100%', ccg: 0, ccgPercent: '0%' },
    { stt: 3, competency: 'GQVĐ và sáng tạo', dat: 48, datPercent: '100%', ccg: 0, ccgPercent: '0%' },
    { stt: 4, competency: 'Ngôn ngữ', dat: 46, datPercent: '95.8%', ccg: 2, ccgPercent: '4.2%' },
    { stt: 5, competency: 'Tính toán', dat: 45, datPercent: '93.8%', ccg: 3, ccgPercent: '6.2%' },
    { stt: 6, competency: 'Khoa học', dat: 47, datPercent: '97.9%', ccg: 1, ccgPercent: '2.1%' },
    { stt: 7, competency: 'Công nghệ', dat: 46, datPercent: '95.8%', ccg: 2, ccgPercent: '4.2%' },
    { stt: 8, competency: 'Tin học', dat: 48, datPercent: '100%', ccg: 0, ccgPercent: '0%' },
    { stt: 9, competency: 'Thẩm mỹ', dat: 47, datPercent: '97.9%', ccg: 1, ccgPercent: '2.1%' },
    { stt: 10, competency: 'Thể chất', dat: 48, datPercent: '100%', ccg: 0, ccgPercent: '0%' }
  ];

  ngOnInit() {
    this.initSubjectsGrid();
    this.initQualitiesGrid();
    this.initCompetenciesGrid();
  }

  initSubjectsGrid() {
    this.subjectsGridOptions = {
      columnDefs: [
        { 
          headerName: 'STT', 
          field: 'stt', 
          width: 70, 
          pinned: 'left',
          cellStyle: { textAlign: 'center', fontWeight: '600', background: '#fafafa' }
        },
        { 
          headerName: 'Môn học và hoạt động giáo dục', 
          field: 'subject', 
          width: 250, 
          pinned: 'left',
          cellStyle: { fontWeight: '600', background: '#fafafa' }
        },
        {
          headerName: 'Mức đạt được',
          width: 280, 
          headerClass: 'header-group-main',
          children: [
            {
              headerName: 'Hoàn thành tốt',
              headerClass: 'header-excellent',
              children: [
                { headerName: 'Số lượng', field: 'htt', width: 100, cellClass: 'excellent-cell' },
                { headerName: 'Tỉ lệ %', field: 'httPercent', width: 100, cellClass: 'excellent-cell' }
              ]
            },
            {
              headerName: 'Hoàn thành',
              headerClass: 'header-good',
              children: [
                { headerName: 'Số lượng', field: 'ht', width: 100, cellClass: 'good-cell' },
                { headerName: 'Tỉ lệ %', field: 'htPercent', width: 100, cellClass: 'good-cell' }
              ]
            },
            {
              headerName: 'Chưa hoàn thành',
              headerClass: 'header-warning',
              children: [
                { headerName: 'Số lượng', field: 'cht', width: 100, cellClass: 'warning-cell' },
                { headerName: 'Tỉ lệ %', field: 'chtPercent', width: 100, cellClass: 'warning-cell' }
              ]
            }
          ]
        },
        {
          headerName: 'Điểm KTĐK',
          headerClass: 'header-group-main',
          children: [
            {
              headerName: 'Dưới 5 điểm',
              headerClass: 'header-danger',
              children: [
                { headerName: 'Số lượng', field: 'duoi5', width: 100, cellClass: 'danger-cell' },
                { headerName: 'Tỉ lệ %', field: 'duoi5Percent', width: 100, cellClass: 'danger-cell' }
              ]
            },
            {
              headerName: '5 điểm trở lên',
              headerClass: 'header-success',
              children: [
                { headerName: 'Số lượng', field: 'tren5', width: 100, cellClass: 'success-cell' },
                { headerName: 'Tỉ lệ %', field: 'tren5Percent', width: 100, cellClass: 'success-cell' }
              ]
            }
          ]
        }
      ],
      rowData: this.subjectsData,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: { textAlign: 'center' }
      },
      suppressMovableColumns: true,
      enableRangeSelection: true,
      animateRows: true
    };
  }

  initQualitiesGrid() {
    this.qualitiesGridOptions = {
      columnDefs: [
        { 
          headerName: 'STT', 
          field: 'stt', 
          width: 70, 
          pinned: 'left',
          cellStyle: { textAlign: 'center', fontWeight: '600', background: '#fafafa' }
        },
        { 
          headerName: 'Phẩm chất', 
          field: 'quality', 
          width: 220, 
          pinned: 'left',
          cellStyle: { fontWeight: '600', background: '#fafafa' }
        },
        {
          headerName: 'Mức đạt được',
          headerClass: 'header-group-main',
          children: [
            {
              headerName: 'Tốt',
              headerClass: 'header-excellent',
              children: [
                { headerName: 'Số lượng', field: 'tot', width: 120, cellClass: 'excellent-cell' },
                { headerName: 'Tỉ lệ %', field: 'totPercent', width: 120, cellClass: 'excellent-cell' }
              ]
            },
            {
              headerName: 'Đạt',
              headerClass: 'header-good',
              children: [
                { headerName: 'Số lượng', field: 'dat', width: 120, cellClass: 'good-cell' },
                { headerName: 'Tỉ lệ %', field: 'datPercent', width: 120, cellClass: 'good-cell' }
              ]
            },
            {
              headerName: 'Cần cố gắng',
              headerClass: 'header-warning',
              children: [
                { headerName: 'Số lượng', field: 'ccg', width: 120, cellClass: 'warning-cell' },
                { headerName: 'Tỉ lệ %', field: 'ccgPercent', width: 120, cellClass: 'warning-cell' }
              ]
            }
          ]
        }
      ],
      rowData: this.qualitiesData,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: { textAlign: 'center' }
      },
      suppressMovableColumns: true,
      enableRangeSelection: true,
      animateRows: true
    };
  }

  initCompetenciesGrid() {
    this.competenciesGridOptions = {
      columnDefs: [
        { 
          headerName: 'STT', 
          field: 'stt', 
          width: 70, 
          pinned: 'left',
          cellStyle: { textAlign: 'center', fontWeight: '600', background: '#fafafa' }
        },
        { 
          headerName: 'Năng lực cốt lõi', 
          field: 'competency', 
          width: 220, 
          pinned: 'left',
          cellStyle: { fontWeight: '600', background: '#fafafa' }
        },
        {
          headerName: 'Mức đạt được',
          headerClass: 'header-group-main',
          children: [
            {
              headerName: 'Đạt',
              headerClass: 'header-success',
              children: [
                { headerName: 'Số lượng', field: 'dat', width: 150, cellClass: 'success-cell' },
                { headerName: 'Tỉ lệ %', field: 'datPercent', width: 150, cellClass: 'success-cell' }
              ]
            },
            {
              headerName: 'Cần cố gắng',
              headerClass: 'header-warning',
              children: [
                { headerName: 'Số lượng', field: 'ccg', width: 150, cellClass: 'warning-cell' },
                { headerName: 'Tỉ lệ %', field: 'ccgPercent', width: 150, cellClass: 'warning-cell' }
              ]
            }
          ]
        }
      ],
      rowData: this.competenciesData,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: { textAlign: 'center' }
      },
      suppressMovableColumns: true,
      enableRangeSelection: true,
      animateRows: true
    };
  }

  gradeChange(event: any) {
    console.log('Grade changed:', event);
  }

  classChange(event: any) {
    console.log('Class changed:', event);
  }
  onExporting(event: any) {
   
  }
}