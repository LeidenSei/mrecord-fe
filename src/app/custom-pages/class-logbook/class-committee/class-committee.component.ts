import { Component, OnInit } from '@angular/core';

interface CommitteeMember {
  id?: number;
  stt: number;
  studentName: string;
  position: string;
  teamNumber?: number;
}

@Component({
  selector: 'app-class-committee',
  templateUrl: './class-committee.component.html',
  styleUrls: ['./class-committee.component.scss']
})
export class ClassCommitteeComponent implements OnInit {
  datas: CommitteeMember[] = [];
  committeeCount = 0;
  
  // Filter data
  gradeSource = ['Tất cả', 'Khối 1', 'Khối 2', 'Khối 3', 'Khối 4',  'Khối 5'];
  filterClassSource: any[] = [];
  filterClassId: any = null;
  
  // Lookup data
  studentSource: any[] = [];
  positionSource = [
    { value: 'class_monitor', name: 'Lớp trưởng' },
    { value: 'vice_monitor_1', name: 'Lớp phó thứ nhất' },
    { value: 'vice_monitor_2', name: 'Lớp phó thứ hai' },
    { value: 'team_leader', name: 'Tổ trưởng' },
    { value: 'team_vice_leader', name: 'Tổ phó' },
    { value: 'member', name: 'Thành viên' }
  ];
  
  teamSource = [
    { value: 1, name: 'Tổ 1' },
    { value: 2, name: 'Tổ 2' },
    { value: 3, name: 'Tổ 3' },
    { value: 4, name: 'Tổ 4' }
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
    // Load class list for filter
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
    // Load student list for lookup
    this.studentSource = [
      { id: 1, fullName: 'Nguyễn Văn An', className: '6A1' },
      { id: 2, fullName: 'Trần Thị Bình', className: '6A1' },
      { id: 3, fullName: 'Lê Văn Cường', className: '6A1' },
      { id: 4, fullName: 'Phạm Thị Dung', className: '6A1' },
      { id: 5, fullName: 'Hoàng Văn Em', className: '6A1' }
    ];
  }

  loadCommitteeData(): void {
    // Sample data
    this.datas = [
      {
        id: 1,
        stt: 1,
        studentName: 'Nguyễn Văn An',
        position: 'class_monitor',
        teamNumber: undefined,
      },
      {
        id: 2,
        stt: 2,
        studentName: 'Trần Thị Bình',
        position: 'vice_monitor_1',
        teamNumber: undefined,
      },
      {
        id: 3,
        stt: 3,
        studentName: 'Lê Văn Cường',
        position: 'vice_monitor_2',
        teamNumber: undefined,
      },
      {
        id: 4,
        stt: 4,
        studentName: 'Phạm Thị Dung',
        position: 'team_leader',
        teamNumber: 1,
      },
      {
        id: 5,
        stt: 5,
        studentName: 'Hoàng Văn Em',
        position: 'team_leader',
        teamNumber: 2,
      }
    ];
    
    this.committeeCount = this.datas.length;
  }

  gradeChange(event: any): void {
    console.log('Grade changed:', event);
    // Implement grade filter logic
  }

  classChange(event: any): void {
    this.filterClassId = event.itemData.id;
    console.log('Class changed:', event.itemData);
    // Implement class filter logic
  }

  onExporting(event: any): void {
    console.log('Exporting data');
  }

  onRowUpdating(event: any): void {
    console.log('Updating row:', event);
    // Validate position constraints
    if (event.newData.position && !this.validatePosition(event.newData.position, event.key)) {
      event.cancel = true;
      // Show error message
    }
  }

  onRowInserting(event: any): void {
    console.log('Inserting row:', event);
    // Validate position constraints
    if (event.data.position && !this.validatePosition(event.data.position)) {
      event.cancel = true;
      // Show error message
    } else {
      // Auto assign STT
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
      'class_monitor': 'position-monitor',
      'vice_monitor_1': 'position-vice-monitor',
      'vice_monitor_2': 'position-vice-monitor',
      'team_leader': 'position-team-leader',
      'team_vice_leader': 'position-team-vice',
      'member': 'position-member'
    };
    return classes[position as keyof typeof classes] || '';
  }

  needsTeam(position: string): boolean {
    return ['team_leader', 'team_vice_leader', 'member'].includes(position);
  }

  private validatePosition(position: string, excludeId?: number): boolean {
    const currentData = this.datas.filter(d => d.id !== excludeId);
    
    // Check unique positions
    if (['class_monitor', 'vice_monitor_1', 'vice_monitor_2'].includes(position)) {
      return !currentData.some(d => d.position === position);
    }
    
    // Check team leader limit (1 per team)
    if (position === 'team_leader') {
      // Additional validation would be needed here
    }
    
    return true;
  }
}