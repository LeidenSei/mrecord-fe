import { Component, OnInit } from '@angular/core';

interface ParentCommittee {
  id?: number;
  stt: number;
  position: string;
  parentName: string;
  phoneNumber: string;
  workplace: string;
  studentName: string;
  relationship: string;
  email?: string;
  address?: string;
}

@Component({
  selector: 'app-parent-committee',
  templateUrl: './parent-committee.component.html',
  styleUrls: ['./parent-committee.component.scss']
})
export class ParentCommitteeComponent implements OnInit {
  datas: ParentCommittee[] = [];
  committeeCount = 0;

  gradeSource = ['Tất cả', 'Khối 6', 'Khối 7', 'Khối 8', 'Khối 9'];
  filterClassSource: any[] = [];
  filterClassId: any = null;
  
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
  positionSource = [
    { value: 'president', name: 'Trưởng ban' },
    { value: 'vice_president', name: 'Phó ban' },
    { value: 'secretary', name: 'Thư ký' },
    { value: 'treasurer', name: 'Thủ quỹ' },
    { value: 'member', name: 'Ủy viên' }
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
    this.loadCommitteeData();
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
      { id: 5, fullName: 'Hoàng Văn Em', className: '6A1' },
      { id: 6, fullName: 'Đỗ Thị Hoa', className: '6A1' }
    ];
  }

  loadCommitteeData(): void {
    this.datas = [
      {
        id: 1,
        stt: 1,
        position: 'president',
        parentName: 'Nguyễn Văn Hùng',
        phoneNumber: '0987654321',
        workplace: 'Công ty TNHH ABC',
        studentName: 'Nguyễn Văn An',
        relationship: 'father',
        email: 'hung.nguyen@abc.com',
        address: '123 Đường Láng, Đống Đa, Hà Nội'
      },
      {
        id: 2,
        stt: 2,
        position: 'vice_president',
        parentName: 'Trần Thị Lan',
        phoneNumber: '0912345678',
        workplace: 'Bệnh viện Bạch Mai',
        studentName: 'Trần Thị Bình',
        relationship: 'mother',
        email: 'lan.tran@bachmai.gov.vn',
        address: '456 Giải Phóng, Hai Bà Trưng, Hà Nội'
      },
      {
        id: 3,
        stt: 3,
        position: 'secretary',
        parentName: 'Lê Thị Mai',
        phoneNumber: '0934567890',
        workplace: 'Trường Đại học Quốc gia',
        studentName: 'Lê Văn Cường',
        relationship: 'mother',
        email: 'mai.le@vnu.edu.vn',
        address: '789 Xuân Thủy, Cầu Giấy, Hà Nội'
      },
      {
        id: 4,
        stt: 4,
        position: 'treasurer',
        parentName: 'Phạm Văn Đức',
        phoneNumber: '0945678901',
        workplace: 'Ngân hàng Vietcombank',
        studentName: 'Phạm Thị Dung',
        relationship: 'father',
        email: 'duc.pham@vietcombank.com.vn',
        address: '321 Cầu Giấy, Cầu Giấy, Hà Nội'
      },
      {
        id: 5,
        stt: 5,
        position: 'member',
        parentName: 'Hoàng Thị Nga',
        phoneNumber: '0956789012',
        workplace: 'Công ty Du lịch Saigontourist',
        studentName: 'Hoàng Văn Em',
        relationship: 'mother',
        email: 'nga.hoang@saigontourist.net',
        address: '654 Kim Mã, Ba Đình, Hà Nội'
      },
      {
        id: 6,
        stt: 6,
        position: 'member',
        parentName: 'Đỗ Văn Nam',
        phoneNumber: '0967890123',
        workplace: 'Viện Công nghệ thông tin',
        studentName: 'Đỗ Thị Hoa',
        relationship: 'father',
        email: 'nam.do@ioit.ac.vn',
        address: '987 Nguyễn Trãi, Thanh Xuân, Hà Nội'
      }
    ];
    
    this.committeeCount = this.datas.length;
  }

  gradeChange(event: any): void {
    console.log('Grade changed:', event);
  }

  classChange(event: any): void {
    this.filterClassId = event.itemData.id;
    console.log('Class changed:', event.itemData);
  }

  positionFilterChange(event: any): void {
    this.selectedPositionFilter = event.itemData.value;
    console.log('Position filter changed:', event.itemData);
  }

  onExporting(event: any): void {
    console.log('Exporting data');
  }

  onRowUpdating(event: any): void {
    if (event.newData.position && !this.validatePosition(event.newData.position, event.key)) {
      event.cancel = true;
    }
  }

  onRowInserting(event: any): void {
    console.log('Inserting row:', event);
    if (event.data.position && !this.validatePosition(event.data.position)) {
      event.cancel = true;
    } else {
      event.data.stt = this.datas.length + 1;
    }
  }

  onRowRemoving(event: any): void {
    console.log('Removing row:', event);
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

  private validatePosition(position: string, excludeId?: number): boolean {
    const currentData = this.datas.filter(d => d.id !== excludeId);
    
    if (['president', 'vice_president', 'secretary', 'treasurer'].includes(position)) {
      return !currentData.some(d => d.position === position);
    }
    
    return true;
  }
}